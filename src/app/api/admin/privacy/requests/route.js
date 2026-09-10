import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { executeControlledErasure } from '@/lib/dpdp/retention';

// GET /api/admin/privacy/requests
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const db = getDb();
    let query = `
      SELECT pr.*, u.name as citizen_name, u.phone as citizen_phone, u.email as citizen_email
      FROM privacy_requests pr
      JOIN users u ON pr.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      query += ' AND pr.status = ?';
      params.push(status);
    }
    if (type && type !== 'all') {
      query += ' AND pr.request_type = ?';
      params.push(type);
    }

    query += ' ORDER BY pr.created_at DESC';
    const requests = await db.prepare(query).all(...params);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching admin privacy requests:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy requests' }, { status: 500 });
  }
}

// PUT /api/admin/privacy/requests
export async function PUT(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, action, notes, resolution } = body;

    if (!requestId || !action) {
      return NextResponse.json({ error: 'requestId and action are required' }, { status: 400 });
    }

    const db = getDb();
    const req = await db.prepare('SELECT * FROM privacy_requests WHERE id = ?').get(requestId);
    if (!req) {
      return NextResponse.json({ error: 'Privacy request not found' }, { status: 404 });
    }

    // Handle actions:
    // 'verify_identity' -> status: 'verified', verification_status: 'verified'
    // 'start_processing' -> status: 'processing'
    // 'execute_erasure' -> call executeControlledErasure
    // 'resolve' -> status: 'completed'
    // 'reject' -> status: 'rejected'

    if (action === 'execute_erasure') {
      const result = executeControlledErasure({
        userId: req.user_id,
        requestId: req.id,
        actorId: session.userId,
        reason: notes || 'Approved and executed by administrator under DPDP Act',
      });
      return NextResponse.json({ success: true, message: 'Erasure executed', result });
    }

    let nextStatus = req.status;
    let verificationStatus = req.verification_status;

    if (action === 'verify_identity') {
      nextStatus = 'verified';
      verificationStatus = 'verified';
    } else if (action === 'start_processing') {
      nextStatus = 'processing';
    } else if (action === 'resolve') {
      nextStatus = 'completed';
    } else if (action === 'reject') {
      nextStatus = 'rejected';
    }

    const tx = db.transaction(async () => {
      await db.prepare(`
        UPDATE privacy_requests
        SET status = ?,
            verification_status = ?,
            resolution = COALESCE(?, resolution),
            assigned_to = ?,
            resolved_at = CASE WHEN ? IN ('completed', 'rejected') THEN datetime('now') ELSE resolved_at END,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(nextStatus, verificationStatus, resolution, session.userId, nextStatus, requestId);

      await db.prepare(`
        INSERT INTO privacy_request_events (request_id, from_status, to_status, actor_id, actor_role, notes, created_at)
        VALUES (?, ?, ?, ?, 'admin', ?, datetime('now'))
      `).run(requestId, req.status, nextStatus, session.userId, notes || `Admin action: ${action}`);

      await logAudit(db, {
        actorId: session.userId,
        actorRole: 'admin',
        action: `PRIVACY_REQUEST_${action.toUpperCase()}`,
        entityType: 'privacy_request',
        entityId: requestId,
        summary: `Admin transitioned request ${req.request_number} to ${nextStatus}`,
        metadata: { fromStatus: req.status, toStatus: nextStatus, notes },
      });
    });

    await tx();
    return NextResponse.json({ success: true, status: nextStatus });
  } catch (error) {
    console.error('Error updating privacy request:', error);
    return NextResponse.json({ error: error.message || 'Failed to update privacy request' }, { status: 400 });
  }
}
