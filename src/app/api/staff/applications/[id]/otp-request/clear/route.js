import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

// POST — operator confirms they have used (or is discarding) the relayed code.
// Purges the ciphertext immediately. Audits the event, never the value.
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

    const isNumeric = !isNaN(Number(id));
    const app = db
      .prepare(
        `SELECT id, application_number FROM applications
         WHERE ${isNumeric ? 'id = ?' : 'application_number = ?'}`
      )
      .get(isNumeric ? Number(id) : String(id));
    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const info = db
      .prepare(
        `UPDATE otp_relay_requests
         SET status = 'cleared', ciphertext = NULL, cleared_at = datetime('now')
         WHERE application_id = ? AND status IN ('pending', 'fulfilled')`
      )
      .run(app.id);

    await logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'otp.relay.cleared',
      entityType: 'application',
      entityId: app.id,
      summary: `Operator cleared the OTP relay for application ${app.application_number}`,
      metadata: { application_number: app.application_number, cleared_rows: info.changes },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP relay clear error:', error);
    return NextResponse.json({ error: 'Failed to clear OTP request' }, { status: 500 });
  }
}
