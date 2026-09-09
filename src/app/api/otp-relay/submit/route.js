import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const SubmitSchema = z.object({
  requestId: z.number().int().positive(),
  // Base64 RSA-OAEP ciphertext produced on the citizen's device. The server
  // stores this verbatim and can never decrypt it. Bounded to reject junk.
  ciphertext: z.string().min(1).max(4096),
});

// POST /api/otp-relay/submit — the citizen submits the ENCRYPTED code.
// The plaintext OTP never reaches this handler.
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const parsed = SubmitSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'A valid requestId and ciphertext are required' }, { status: 400 });
    }
    const { requestId, ciphertext } = parsed.data;
    const db = getDb();

    const relay = db
      .prepare(
        `SELECT id, application_id, citizen_user_id, status, expires_at
         FROM otp_relay_requests WHERE id = ?`
      )
      .get(requestId);

    // Only the citizen who owns the request may fulfil it.
    if (!relay || relay.citizen_user_id !== session.userId) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    if (relay.status !== 'pending') {
      return NextResponse.json({ error: 'This request is no longer active' }, { status: 409 });
    }
    if (Date.now() > new Date(relay.expires_at).getTime()) {
      db.prepare(`UPDATE otp_relay_requests SET status = 'expired' WHERE id = ?`).run(relay.id);
      return NextResponse.json({ error: 'This request has expired' }, { status: 409 });
    }

    db.prepare(
      `UPDATE otp_relay_requests
       SET ciphertext = ?, status = 'fulfilled', fulfilled_at = datetime('now')
       WHERE id = ?`
    ).run(ciphertext, relay.id);

    // Audit the event, never the value.
    logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'otp.relay.fulfilled',
      entityType: 'application',
      entityId: relay.application_id,
      summary: `Citizen submitted an encrypted OTP for relay request ${relay.id}`,
      metadata: { request_id: relay.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP relay submit error:', error);
    return NextResponse.json({ error: 'Failed to submit code' }, { status: 500 });
  }
}
