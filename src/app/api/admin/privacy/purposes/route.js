import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';

// GET /api/admin/privacy/purposes
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const db = getDb();
    const purposes = db.prepare(`
      SELECT p.*,
             (SELECT COUNT(*) FROM consents WHERE purpose_id = p.id AND consent_status = 'granted') as active_consents_count
      FROM processing_purposes p
      ORDER BY p.is_mandatory DESC, p.id ASC
    `).all();

    return NextResponse.json({ purposes });
  } catch (error) {
    console.error('Error fetching purposes:', error);
    return NextResponse.json({ error: 'Failed to fetch purposes' }, { status: 500 });
  }
}

// PUT /api/admin/privacy/purposes
export async function PUT(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = await request.json();
    const { id, legalBasis, isMandatory, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Purpose ID is required' }, { status: 400 });
    }

    const validBases = ['consent', 'legitimate_use', 'legal_requirement', 'contract', 'other_configured_basis'];
    if (legalBasis && !validBases.includes(legalBasis)) {
      return NextResponse.json({ error: 'Invalid legal basis value' }, { status: 400 });
    }

    const db = getDb();
    db.prepare(`
      UPDATE processing_purposes
      SET legal_basis = COALESCE(?, legal_basis),
          is_mandatory = COALESCE(?, is_mandatory),
          is_active = COALESCE(?, is_active),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(legalBasis, isMandatory, isActive, id);

    logAudit(db, {
      actorId: session.userId,
      actorRole: 'admin',
      action: 'PROCESSING_PURPOSE_UPDATED',
      entityType: 'purpose',
      entityId: id,
      summary: `Admin updated purpose configuration for ID ${id}`,
      metadata: { id, legalBasis, isMandatory, isActive },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating purpose:', error);
    return NextResponse.json({ error: 'Failed to update purpose' }, { status: 500 });
  }
}
