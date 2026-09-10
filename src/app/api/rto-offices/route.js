import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get('districtId');
    const stateId = searchParams.get('stateId');

    let query = 'SELECT * FROM rto_offices WHERE is_active = 1';
    const params = [];

    if (districtId) {
      query += ' AND district_id = ?';
      params.push(districtId);
    } else if (stateId) {
      query += ' AND state_id = ?';
      params.push(stateId);
    } else {
      return NextResponse.json({ error: 'districtId or stateId is required' }, { status: 400 });
    }

    query += ' ORDER BY sort_order, name';
    const rtoOffices = await db.prepare(query).all(...params);

    return NextResponse.json({ rtoOffices });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch RTO offices' }, { status: 500 });
  }
}
