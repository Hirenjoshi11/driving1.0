import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { logAudit, maskMobile } from '@/lib/audit';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const stateId = searchParams.get('stateId');
    const serviceId = searchParams.get('serviceId');

    let whereConditions = ['1=1'];
    const params = [];

    if (status) {
      whereConditions.push('a.status = ?');
      params.push(status);
    }
    if (stateId) {
      whereConditions.push('a.state_id = ?');
      params.push(Number(stateId));
    }
    if (serviceId) {
      whereConditions.push('a.service_id = ?');
      params.push(Number(serviceId));
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const rows = await db.prepare(`
      SELECT 
        a.application_number,
        a.first_name,
        a.last_name,
        a.mobile,
        a.status,
        a.payment_status,
        a.total_payable,
        s.name as state_name,
        ls.name as service_name,
        r.rto_code as rto_code,
        u.name as operator_name,
        a.created_at,
        a.submitted_at
      FROM applications a
      LEFT JOIN states s ON a.state_id = s.id
      LEFT JOIN licence_services ls ON a.service_id = ls.id
      LEFT JOIN rto_offices r ON a.rto_id = r.id
      LEFT JOIN users u ON a.assigned_operator_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT 5000
    `).all(...params);

    // Build CSV - explicitly excluding Aadhaar
    const headers = [
      'Application Number',
      'Applicant Name',
      'Masked Mobile',
      'State',
      'Service',
      'RTO',
      'Status',
      'Payment Status',
      'Total Fee (INR)',
      'Assigned Operator',
      'Created At',
      'Submitted At'
    ];

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [headers.join(',')];
    for (const r of rows) {
      csvLines.push([
        escapeCsv(r.application_number),
        escapeCsv(`${r.first_name || ''} ${r.last_name || ''}`.trim()),
        escapeCsv(maskMobile(r.mobile)),
        escapeCsv(r.state_name),
        escapeCsv(r.service_name),
        escapeCsv(r.rto_code),
        escapeCsv(r.status),
        escapeCsv(r.payment_status),
        escapeCsv(r.total_payable),
        escapeCsv(r.operator_name || 'Unassigned'),
        escapeCsv(r.created_at),
        escapeCsv(r.submitted_at)
      ].join(','));
    }

    const csvContent = csvLines.join('\r\n');

    // Audit the CSV export
    await logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'export.csv',
      entityType: 'application_export',
      summary: `Admin exported ${rows.length} applications to CSV`,
      metadata: {
        exported_rows_count: rows.length,
        filter_status: status || 'all',
        filter_state: stateId || 'all',
        filter_service: serviceId || 'all'
      }
    });

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="dlf-applications-${Date.now()}.csv"`
      }
    });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 });
  }
}
