import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');

    if (!stateId) {
      return NextResponse.json({ error: 'stateId is required' }, { status: 400 });
    }

    const districts = await db.prepare(
      'SELECT * FROM districts WHERE state_id = ? AND is_active = 1 ORDER BY sort_order, name'
    ).all(stateId);

    return NextResponse.json({ districts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch districts' }, { status: 500 });
  }
}
