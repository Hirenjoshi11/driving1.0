import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);

    const action = searchParams.get('action');
    const entityType = searchParams.get('entityType');
    const actorId = searchParams.get('actorId');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get('limit') || '25', 10)));
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    const params = [];

    if (action) {
      whereConditions.push('al.action = ?');
      params.push(action);
    }

    if (entityType) {
      whereConditions.push('al.entity_type = ?');
      params.push(entityType);
    }

    if (actorId) {
      whereConditions.push('al.actor_id = ?');
      params.push(Number(actorId));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      whereConditions.push('(al.summary LIKE ? OR al.entity_id LIKE ? OR u.name LIKE ?)');
      params.push(term, term, term);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const countRow = db.prepare(`
      SELECT COUNT(*) as total 
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      ${whereClause}
    `).get(...params);

    const total = countRow ? countRow.total : 0;

    const logs = db.prepare(`
      SELECT 
        al.id,
        al.actor_id,
        al.actor_role,
        al.action,
        al.entity_type,
        al.entity_id,
        al.summary,
        al.metadata,
        al.ip,
        al.created_at,
        u.name as actor_name
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Audit API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve audit log' }, { status: 500 });
  }
}
