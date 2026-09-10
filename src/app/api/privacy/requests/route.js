import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';
import { executeControlledErasure } from '@/lib/dpdp/retention';

// GET /api/privacy/requests - List citizen's requests
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const requests = await db.prepare(`
      SELECT pr.*, 
             (SELECT COUNT(*) FROM privacy_request_events WHERE request_id = pr.id) as event_count
      FROM privacy_requests pr
      WHERE pr.user_id = ?
      ORDER BY pr.created_at DESC
    `).all(session.userId);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching privacy requests:', error);
    return NextResponse.json({ error: 'Failed to fetch privacy requests' }, { status: 500 });
  }
}

// POST /api/privacy/requests - Create a new rights request
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`priv_req_${session.userId}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetTime);
    }

    const body = await request.json();
    const { requestType, reason, requestDetails } = body;

    const validTypes = ['access', 'correction', 'completion', 'updating', 'erasure', 'consent_withdrawal', 'grievance', 'nomination'];
    if (!requestType || !validTypes.includes(requestType)) {
      return NextResponse.json(
        { error: `Invalid request type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide a clear reason for your privacy request (min 5 characters).' },
        { status: 400 }
      );
    }

    const db = getDb();
    const requestNumber = `DPR-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const tx = db.transaction(async () => {
      // Insert request
      const res = await db.prepare(`
        INSERT INTO privacy_requests (
          request_number, user_id, request_type, status, verification_status,
          verification_method, reason, request_details, created_at, updated_at
        ) VALUES (?, ?, ?, 'created', 'verified', 'authenticated_session', ?, ?, datetime('now'), datetime('now'))
      `).run(
        requestNumber,
        session.userId,
        requestType,
        reason.trim(),
        requestDetails ? JSON.stringify(requestDetails) : null
      );

      const requestId = res.lastInsertRowid;

      // Event log
      await db.prepare(`
        INSERT INTO privacy_request_events (request_id, from_status, to_status, actor_id, actor_role, notes, created_at)
        VALUES (?, NULL, 'created', ?, ?, 'Request submitted by citizen via authenticated session', datetime('now'))
      `).run(requestId, session.userId, session.role);

      await logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'PRIVACY_REQUEST_CREATED',
        entityType: 'privacy_request',
        entityId: requestId,
        summary: `Citizen submitted ${requestType} request (${requestNumber})`,
        ip: clientIp,
      });

      // Special case: If erasure requested directly, check if can execute or mark for review
      return { requestId, requestNumber, status: 'created' };
    });

    const result = await tx();
    return NextResponse.json({ success: true, request: result }, { status: 201 });
  } catch (error) {
    console.error('Error submitting privacy request:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit privacy request' }, { status: 500 });
  }
}
