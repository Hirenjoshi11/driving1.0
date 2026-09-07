import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const rtoId = searchParams.get('rtoId');
    const stateId = searchParams.get('stateId');

    let query = 'SELECT id, rto_id, state_id, name, address, phone, is_active, status, status_note FROM driving_test_centres WHERE 1=1';
    const params = [];

    if (rtoId) {
      query += ' AND rto_id = ?';
      params.push(rtoId);
    } else if (stateId) {
      query += ' AND state_id = ?';
      params.push(stateId);
    }

    query += ' ORDER BY CASE WHEN status = "active" THEN 0 ELSE 1 END, name';
    const testCentres = db.prepare(query).all(...params);

    return NextResponse.json({ testCentres });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch test centres' }, { status: 500 });
  }
}
