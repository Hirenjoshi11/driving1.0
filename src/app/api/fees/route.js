import { NextResponse } from 'next/server';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const stateId = searchParams.get('stateId');

    if (!serviceId || !stateId) {
      return NextResponse.json({ error: 'serviceId and stateId are required' }, { status: 400 });
    }

    const fees = await db.prepare(`
      SELECT * FROM fee_structure 
      WHERE service_id = ? AND state_id = ? AND is_active = 1
      ORDER BY effective_from DESC LIMIT 1
    `).get(serviceId, stateId);

    if (!fees) {
      return NextResponse.json({ fees: null, message: 'No fee structure found' });
    }

    const total = (fees.government_fee || 0) + (fees.service_fee || 0) + 
                  (fees.smart_card_fee || 0) + (fees.test_fee || 0) + 
                  (fees.gateway_fee || 0);

    return NextResponse.json({ 
      fees: {
        ...fees,
        total_payable: total
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 });
  }
}
