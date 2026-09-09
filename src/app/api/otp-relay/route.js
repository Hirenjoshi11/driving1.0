import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
const { getDb } = require('@/lib/db');

// GET /api/otp-relay?appNo=... — a citizen polls for a pending OTP request on
// their OWN application. Returns the operator's public key so the app can
// encrypt the code on-device before sending it.
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const appNo = searchParams.get('appNo');
    const db = getDb();

    // With appNo: that one application (ownership enforced). Without: the most
    // recent pending request across ALL the citizen's applications, so a global
    // watcher can surface the prompt wherever the citizen happens to be.
    let relay;
    if (appNo) {
      const app = db
        .prepare(`SELECT id, user_id FROM applications WHERE application_number = ?`)
        .get(appNo);
      if (!app || app.user_id !== session.userId) {
        return NextResponse.json({ relay: null });
      }
      relay = db
        .prepare(
          `SELECT r.id, r.status, r.operator_public_key, r.expires_at, a.application_number
           FROM otp_relay_requests r JOIN applications a ON a.id = r.application_id
           WHERE r.application_id = ? AND r.status = 'pending'
           ORDER BY r.id DESC LIMIT 1`
        )
        .get(app.id);
    } else {
      relay = db
        .prepare(
          `SELECT r.id, r.status, r.operator_public_key, r.expires_at, a.application_number
           FROM otp_relay_requests r JOIN applications a ON a.id = r.application_id
           WHERE r.citizen_user_id = ? AND r.status = 'pending'
           ORDER BY r.id DESC LIMIT 1`
        )
        .get(session.userId);
    }

    if (!relay || Date.now() > new Date(relay.expires_at).getTime()) {
      return NextResponse.json({ relay: null });
    }

    return NextResponse.json({
      relay: {
        id: relay.id,
        status: relay.status,
        operatorPublicKey: relay.operator_public_key,
        expiresAt: relay.expires_at,
        appNo: relay.application_number,
      },
    });
  } catch (error) {
    console.error('OTP relay citizen poll error:', error);
    return NextResponse.json({ error: 'Failed to check for OTP request' }, { status: 500 });
  }
}
