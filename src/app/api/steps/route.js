import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (!serviceId) {
      return NextResponse.json({ error: 'serviceId is required' }, { status: 400 });
    }

    const steps = db.prepare(
      'SELECT * FROM service_steps WHERE service_id = ? AND is_active = 1 ORDER BY step_number'
    ).all(serviceId);

    return NextResponse.json({ steps });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch steps' }, { status: 500 });
  }
}
