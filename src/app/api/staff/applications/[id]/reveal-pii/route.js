import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

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
    const app = db.prepare(`
      SELECT id, application_number, identity_number, identity_type, date_of_birth, mobile, guardian_aadhaar
      FROM applications
      WHERE ${isNumeric ? 'id = ?' : 'application_number = ?'}
    `).get(isNumeric ? Number(id) : String(id));

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Log the unmasking action in audit log (NEVER store raw PII in metadata)
    logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'pii.reveal',
      entityType: 'application',
      entityId: app.id,
      summary: `Staff user revealed identity number for application ${app.application_number}`,
      metadata: {
        application_number: app.application_number,
        identity_type: app.identity_type,
        timestamp: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      identity_number: app.identity_number || 'Not provided',
      date_of_birth: app.date_of_birth || 'Not provided',
      mobile: app.mobile || 'Not provided',
      guardian_aadhaar: app.guardian_aadhaar || 'Not provided'
    });
  } catch (error) {
    console.error('Reveal PII API error:', error);
    return NextResponse.json({ error: 'Failed to unmask PII' }, { status: 500 });
  }
}
