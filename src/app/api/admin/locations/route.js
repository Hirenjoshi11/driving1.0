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
    const stateId = searchParams.get('stateId');

    const states = await db.prepare(`
      SELECT 
        s.*,
        (SELECT COUNT(*) FROM districts d WHERE d.state_id = s.id) as district_count,
        (SELECT COUNT(*) FROM rto_offices r WHERE r.state_id = s.id) as rto_count,
        (SELECT COUNT(*) FROM applications a WHERE a.state_id = s.id) as application_count
      FROM states s
      ORDER BY s.sort_order ASC, s.name ASC
    `).all();

    let rtosQuery = `
      SELECT 
        r.*,
        s.name as state_name,
        s.code as state_code,
        d.name as district_name,
        (SELECT COUNT(*) FROM applications a WHERE a.rto_id = r.id) as application_count
      FROM rto_offices r
      JOIN states s ON r.state_id = s.id
      LEFT JOIN districts d ON r.district_id = d.id
    `;
    const rtoParams = [];

    if (stateId) {
      rtosQuery += ' WHERE r.state_id = ?';
      rtoParams.push(Number(stateId));
    }
    rtosQuery += ' ORDER BY s.name ASC, r.rto_code ASC';

    const rawRtos = await db.prepare(rtosQuery).all(...rtoParams);
    const rtos = rawRtos.map(r => ({ ...r, code: r.rto_code }));

    const testCentres = await db.prepare(`
      SELECT 
        dtc.*,
        r.name as rto_name,
        r.rto_code as rto_code,
        s.name as state_name
      FROM driving_test_centres dtc
      JOIN rto_offices r ON dtc.rto_id = r.id
      JOIN states s ON r.state_id = s.id
      ${stateId ? 'WHERE r.state_id = ?' : ''}
      ORDER BY s.name ASC, r.rto_code ASC
    `).all(...(stateId ? [Number(stateId)] : []));

    return NextResponse.json({
      states,
      rtos,
      testCentres
    });
  } catch (error) {
    console.error('Locations API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve locations' }, { status: 500 });
  }
}
