import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

// GET /api/admin/privacy/audit?action=&actorRole=&date=&format=
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const role = searchParams.get('role');
    const entityType = searchParams.get('entityType');
    const format = searchParams.get('format'); // 'json' or 'csv'
    const limit = Math.min(200, Number(searchParams.get('limit') || 50));

    const db = getDb();
    let query = `
      SELECT al.*, u.name as actor_name, u.phone as actor_phone
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (action) {
      query += ' AND al.action LIKE ?';
      params.push(`%${action}%`);
    }
    if (role) {
      query += ' AND al.actor_role = ?';
      params.push(role);
    }
    if (entityType) {
      query += ' AND al.entity_type = ?';
      params.push(entityType);
    }

    query += ' ORDER BY al.created_at DESC LIMIT ?';
    params.push(limit);

    const logs = db.prepare(query).all(...params);

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Actor Role', 'Actor Name', 'Action', 'Entity Type', 'Entity ID', 'Summary', 'IP'];
      const rows = logs.map(l => [
        l.id,
        `"${l.created_at}"`,
        `"${l.actor_role || 'system'}"`,
        `"${l.actor_name || 'System / Auto'}"`,
        `"${l.action}"`,
        `"${l.entity_type}"`,
        `"${l.entity_id || ''}"`,
        `"${(l.summary || '').replace(/"/g, '""')}"`,
        `"${l.ip || ''}"`,
      ]);

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="privacy_audit_report_${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}
