import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');

    let services;

    if (stateId) {
      services = db.prepare(`
        SELECT ls.* FROM licence_services ls
        INNER JOIN state_services ss ON ls.id = ss.service_id
        WHERE ss.state_id = ? AND ss.is_active = 1 AND ls.is_active = 1
        ORDER BY ls.sort_order
      `).all(stateId);
    } else {
      services = db.prepare(
        'SELECT * FROM licence_services WHERE is_active = 1 ORDER BY sort_order'
      ).all();
    }

    return NextResponse.json({ services });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
}
