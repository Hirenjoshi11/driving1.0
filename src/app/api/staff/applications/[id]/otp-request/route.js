import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');
const { createNotification } = require('@/lib/notifications');

// How long the relayed code stays usable. Deliberately generous relative to the
// operator's 60s on-screen countdown: a government OTP is typically valid ~10
// minutes, and we must never expire a code the citizen can still legitimately
// use. The countdown creates urgency; this is the real deadline.
const RELAY_TTL_MS = 10 * 60 * 1000;

const OpenSchema = z.object({
  operatorPublicKey: z.string().min(1),
});

function resolveApp(db, id) {
  const isNumeric = !isNaN(Number(id));
  return db
    .prepare(
      `SELECT id, application_number, user_id FROM applications
       WHERE ${isNumeric ? 'id = ?' : 'application_number = ?'}`
    )
    .get(isNumeric ? Number(id) : String(id));
}

// POST — operator opens a relay request with their ephemeral public key.
export async function POST(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }
    const { id } = await params;
    const db = getDb();
    if (!isApplicationInScope(db, session, id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    const app = resolveApp(db, id);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const parsed = OpenSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'operatorPublicKey is required' }, { status: 400 });
    }

    const expiresAt = new Date(Date.now() + RELAY_TTL_MS).toISOString();

    const open = db.transaction(async () => {
      // Retire any earlier live request for this application.
      await db.prepare(
        `UPDATE otp_relay_requests SET status = 'superseded', ciphertext = NULL
         WHERE application_id = ? AND status IN ('pending', 'fulfilled')`
      ).run(app.id);

      const info = db
        .prepare(
          `INSERT INTO otp_relay_requests
             (application_id, citizen_user_id, requested_by, operator_public_key, status, expires_at)
           VALUES (?, ?, ?, ?, 'pending', ?)`
        )
        .run(app.id, app.user_id, session.userId, parsed.data.operatorPublicKey, expiresAt);

      await createNotification(db, {
        userId: app.user_id,
        applicationId: app.id,
        type: 'otp_requested',
        titleKey: 'notifications.otpRequested.title',
        bodyKey: 'notifications.otpRequested.body',
        params: { appNo: app.application_number },
      });

      await logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'otp.relay.requested',
        entityType: 'application',
        entityId: app.id,
        summary: `Operator requested an OTP relay for application ${app.application_number}`,
        metadata: { application_number: app.application_number, request_id: info.lastInsertRowid },
      });

      return info.lastInsertRowid;
    });

    const requestId = await open();
    return NextResponse.json({ success: true, requestId, expiresAt });
  } catch (error) {
    console.error('OTP relay open error:', error);
    return NextResponse.json({ error: 'Failed to open OTP request' }, { status: 500 });
  }
}

// GET — operator polls for the current relay state (and the ciphertext once the
// citizen has submitted it).
export async function GET(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }
    const { id } = await params;
    const db = getDb();
    if (!isApplicationInScope(db, session, id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }
    const app = resolveApp(db, id);
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const relay = db
      .prepare(
        `SELECT id, status, ciphertext, expires_at, created_at, fulfilled_at
         FROM otp_relay_requests
         WHERE application_id = ?
         ORDER BY id DESC LIMIT 1`
      )
      .get(app.id);

    if (!relay) {
      return NextResponse.json({ relay: null });
    }

    // Lazily expire a pending request whose window has passed.
    let status = relay.status;
    if (status === 'pending' && Date.now() > new Date(relay.expires_at).getTime()) {
      await db.prepare(`UPDATE otp_relay_requests SET status = 'expired' WHERE id = ?`).run(relay.id);
      status = 'expired';
    }

    return NextResponse.json({
      relay: {
        id: relay.id,
        status,
        expiresAt: relay.expires_at,
        createdAt: relay.created_at,
        fulfilledAt: relay.fulfilled_at,
        // Ciphertext is handed over only while it is fulfilled and unexpired.
        ciphertext: status === 'fulfilled' ? relay.ciphertext : null,
      },
    });
  } catch (error) {
    console.error('OTP relay poll error:', error);
    return NextResponse.json({ error: 'Failed to read OTP request' }, { status: 500 });
  }
}
