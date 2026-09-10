import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';

// GET /api/privacy/nomination
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const nomination = await db.prepare(`
      SELECT * FROM nominations 
      WHERE user_id = ? AND status = 'active'
      LIMIT 1
    `).get(session.userId);

    return NextResponse.json({ nomination: nomination || null });
  } catch (error) {
    console.error('Error fetching nomination:', error);
    return NextResponse.json({ error: 'Failed to fetch nomination' }, { status: 500 });
  }
}

// POST /api/privacy/nomination
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { nomineeName, nomineeRelationship, nomineePhone, nomineeEmail, nomineeIdType, nomineeIdNumber, action } = body;

    const db = getDb();

    if (action === 'revoke') {
      await db.prepare(`
        UPDATE nominations 
        SET status = 'revoked', updated_at = datetime('now')
        WHERE user_id = ? AND status = 'active'
      `).run(session.userId);

      await logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'NOMINATION_REVOKED',
        entityType: 'nomination',
        entityId: session.userId,
        summary: `Citizen revoked active nominee under DPDP Act`,
      });

      return NextResponse.json({ success: true, message: 'Nomination revoked' });
    }

    if (!nomineeName || !nomineeRelationship || !nomineePhone) {
      return NextResponse.json(
        { error: 'Nominee Name, Relationship, and Phone number are required.' },
        { status: 400 }
      );
    }

    // Mask ID number if provided
    let maskedId = null;
    if (nomineeIdNumber) {
      const clean = String(nomineeIdNumber).replace(/\s+/g, '');
      maskedId = clean.length >= 4 ? `XXXX-XXXX-${clean.slice(-4)}` : 'XXXX-XXXX';
    }

    const tx = db.transaction(async () => {
      // Deactivate existing
      await db.prepare(`
        UPDATE nominations SET status = 'revoked', updated_at = datetime('now')
        WHERE user_id = ? AND status = 'active'
      `).run(session.userId);

      // Insert new
      const res = await db.prepare(`
        INSERT INTO nominations (
          user_id, nominee_name, nominee_relationship, nominee_phone,
          nominee_email, nominee_id_type, nominee_id_masked, status,
          verification_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'verified', datetime('now'), datetime('now'))
      `).run(
        session.userId,
        nomineeName.trim(),
        nomineeRelationship.trim(),
        nomineePhone.trim(),
        nomineeEmail ? nomineeEmail.trim() : null,
        nomineeIdType || 'Aadhaar',
        maskedId
      );

      await logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'NOMINATION_DESIGNATED',
        entityType: 'nomination',
        entityId: res.lastInsertRowid,
        summary: `Citizen designated nominee ${nomineeName} (${nomineeRelationship}) under DPDP Act`,
      });

      return { nominationId: res.lastInsertRowid };
    });

    const result = await tx();
    return NextResponse.json({ success: true, nominationId: result.nominationId }, { status: 201 });
  } catch (error) {
    console.error('Error saving nomination:', error);
    return NextResponse.json({ error: 'Failed to update nomination' }, { status: 500 });
  }
}
