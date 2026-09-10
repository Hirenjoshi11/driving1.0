import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const stateId = searchParams.get('stateId');

    if (serviceId && stateId) {
      const classes = await db.prepare(`
        SELECT vc.* FROM vehicle_classes vc
        INNER JOIN service_vehicle_classes svc ON vc.id = svc.vehicle_class_id
        WHERE svc.service_id = ? AND svc.state_id = ? AND svc.is_active = 1 AND vc.is_active = 1
        ORDER BY vc.sort_order
      `).all(serviceId, stateId);
      return NextResponse.json({ vehicleClasses: classes });
    }

    const classes = await db.prepare('SELECT * FROM vehicle_classes WHERE is_active = 1 ORDER BY sort_order').all();
    return NextResponse.json({ vehicleClasses: classes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch vehicle classes' }, { status: 500 });
  }
}
