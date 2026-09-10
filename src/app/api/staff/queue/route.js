import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { scopeClause } from '@/lib/scope';
import { maskMobile } from '@/lib/audit';
const { getDb } = require('@/lib/db');

/**
 * GET /api/staff/queue
 * Server-paginated queue with narrow explicit projection & jurisdiction scoping.
 * Accessible to 'operator' and 'admin'.
 */
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status');
    const serviceId = searchParams.get('serviceId');
    const stateId = searchParams.get('stateId');
    const rtoId = searchParams.get('rtoId');
    const assigned = searchParams.get('assigned'); // 'me', 'unassigned', 'all'
    const search = searchParams.get('search');
    const overdue = searchParams.get('overdue'); // '1' or 'true'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25', 10)));
    const offset = (page - 1) * limit;

    // Apply jurisdiction scope
    const { sql: scopeSql, params: scopeParams } = await scopeClause(db, session, 'a');

    let whereConditions = [scopeSql];
    let queryParams = [...scopeParams];

    if (status) {
      whereConditions.push('a.status = ?');
      queryParams.push(status);
    }

    if (serviceId) {
      whereConditions.push('a.service_id = ?');
      queryParams.push(Number(serviceId));
    }

    if (stateId) {
      whereConditions.push('a.state_id = ?');
      queryParams.push(Number(stateId));
    }

    if (rtoId) {
      whereConditions.push('a.rto_id = ?');
      queryParams.push(Number(rtoId));
    }

    if (assigned === 'me') {
      whereConditions.push('a.assigned_operator_id = ?');
      queryParams.push(session.userId);
    } else if (assigned === 'unassigned') {
      whereConditions.push('a.assigned_operator_id IS NULL');
    }

    if (overdue === '1' || overdue === 'true') {
      whereConditions.push("a.sla_due_at IS NOT NULL AND a.sla_due_at < datetime('now') AND a.status NOT IN ('completed', 'draft')");
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereConditions.push('(a.application_number LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ? OR a.mobile LIKE ?)');
      queryParams.push(term, term, term, term);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Total count
    const countSql = `SELECT COUNT(*) as total FROM applications a ${whereClause}`;
    const countRow = await db.prepare(countSql).get(...queryParams);
    const total = countRow ? countRow.total : 0;

    // Narrow column projection (NO PII like unmasked Aadhaar, DoB, full address)
    const selectSql = `
      SELECT 
        a.id,
        a.application_number,
        a.first_name,
        a.last_name,
        a.mobile,
        a.status,
        a.payment_status,
        a.total_payable,
        a.assigned_operator_id,
        a.created_at,
        a.submitted_at,
        a.assigned_at,
        a.sla_due_at,
        s.name as state_name,
        s.code as state_code,
        ls.name as service_name,
        ls.slug as service_code,
        r.rto_code as rto_code,
        r.name as rto_name,
        u.name as operator_name,
        (SELECT COUNT(*) FROM application_documents ad WHERE ad.application_id = a.id) as total_docs,
        (SELECT COUNT(*) FROM application_documents ad WHERE ad.application_id = a.id AND ad.upload_status = 'verified') as verified_docs
      FROM applications a
      LEFT JOIN states s ON a.state_id = s.id
      LEFT JOIN licence_services ls ON a.service_id = ls.id
      LEFT JOIN rto_offices r ON a.rto_id = r.id
      LEFT JOIN users u ON a.assigned_operator_id = u.id
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN a.status = 'submitted' THEN 1
          WHEN a.status = 'resubmitted' THEN 2
          WHEN a.status = 'under_review' THEN 3
          WHEN a.status = 'assigned' THEN 4
          WHEN a.status = 'government_processing' THEN 5
          WHEN a.status = 'correction_required' THEN 6
          ELSE 7
        END ASC,
        a.created_at ASC
      LIMIT ? OFFSET ?
    `;

    const rows = await db.prepare(selectSql).all(...queryParams, limit, offset);

    // Mask phone number before sending
    const sanitizedRows = rows.map(r => ({
      ...r,
      applicant_name: `${r.first_name || ''} ${r.last_name || ''}`.trim() || 'Applicant',
      masked_mobile: maskMobile(r.mobile),
      mobile: undefined, // Strip raw mobile from queue response
      is_overdue: Boolean(r.sla_due_at && new Date(r.sla_due_at) < new Date() && r.status !== 'completed'),
      age_hours: r.submitted_at || r.created_at ? Math.max(0, Math.floor((Date.now() - new Date(r.submitted_at || r.created_at).getTime()) / (1000 * 60 * 60))) : 0
    }));

    return NextResponse.json({
      applications: sanitizedRows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Queue API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve application queue' }, { status: 500 });
  }
}
