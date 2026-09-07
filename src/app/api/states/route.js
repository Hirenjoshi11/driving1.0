import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET() {
  try {
    const db = getDb();
    const states = db.prepare('SELECT * FROM states WHERE is_active = 1 ORDER BY sort_order').all();
    return NextResponse.json({ states });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch states' }, { status: 500 });
  }
}
