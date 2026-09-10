import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { runRetentionSweep } from '@/lib/dpdp/retention';

// GET /api/admin/privacy/retention
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const db = getDb();
    const policies = await db.prepare('SELECT * FROM retention_policies ORDER BY is_active DESC, id ASC').all();
    const legalHolds = await db.prepare(`
      SELECT lh.*, u.name as citizen_name, u.phone as citizen_phone
      FROM legal_holds lh
      LEFT JOIN users u ON lh.user_id = u.id
      ORDER BY lh.is_active DESC, lh.placed_at DESC
    `).all();
    const recentDeletionJobs = await db.prepare(`
      SELECT dj.*, u.name as citizen_name
      FROM deletion_jobs dj
      LEFT JOIN users u ON dj.user_id = u.id
      ORDER BY dj.created_at DESC
      LIMIT 20
    `).all();

    return NextResponse.json({ policies, legalHolds, recentDeletionJobs });
  } catch (error) {
    console.error('Error fetching retention data:', error);
    return NextResponse.json({ error: 'Failed to fetch retention configuration' }, { status: 500 });
  }
}

// POST /api/admin/privacy/retention
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    const db = getDb();

    // Action 1: Manual sweep
    if (action === 'run_sweep') {
      const sweepReport = runRetentionSweep();
      await logAudit(db, {
        actorId: session.userId,
        actorRole: 'admin',
        action: 'RETENTION_SWEEP_EXECUTED',
        entityType: 'retention',
        summary: `Admin triggered retention sweep: ${sweepReport.processedCount} records handled`,
        metadata: sweepReport,
      });
      return NextResponse.json({ success: true, report: sweepReport });
    }

    // Action 2: Place Legal Hold
    if (action === 'place_hold') {
      const { entityType, entityId, userId, reason, legalReference } = body;
      if (!entityType || !entityId || !reason) {
        return NextResponse.json({ error: 'entityType, entityId, and reason are required' }, { status: 400 });
      }

      const res = await db.prepare(`
        INSERT INTO legal_holds (entity_type, entity_id, user_id, reason, legal_reference, placed_by, placed_at, is_active)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), 1)
      `).run(entityType, String(entityId), userId || null, reason, legalReference || null, session.userId);

      await logAudit(db, {
        actorId: session.userId,
        actorRole: 'admin',
        action: 'LEGAL_HOLD_PLACED',
        entityType: 'legal_hold',
        entityId: res.lastInsertRowid,
        summary: `Placed legal hold on ${entityType} ${entityId}: ${reason}`,
        metadata: { entityType, entityId, reason, legalReference },
      });

      return NextResponse.json({ success: true, holdId: res.lastInsertRowid });
    }

    // Action 3: Release Legal Hold
    if (action === 'release_hold') {
      const { holdId } = body;
      if (!holdId) return NextResponse.json({ error: 'holdId is required' }, { status: 400 });

      await db.prepare(`
        UPDATE legal_holds 
        SET is_active = 0, released_by = ?, released_at = datetime('now')
        WHERE id = ?
      `).run(session.userId, holdId);

      await logAudit(db, {
        actorId: session.userId,
        actorRole: 'admin',
        action: 'LEGAL_HOLD_RELEASED',
        entityType: 'legal_hold',
        entityId: holdId,
        summary: `Released legal hold ID ${holdId}`,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid retention action' }, { status: 400 });
  } catch (error) {
    console.error('Error in retention action:', error);
    return NextResponse.json({ error: error.message || 'Retention operation failed' }, { status: 500 });
  }
}
