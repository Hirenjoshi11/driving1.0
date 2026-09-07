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

    const documents = db.prepare(`
      SELECT sd.*, dt.name, dt.name_hi, dt.name_gu, dt.code, dt.category, 
             dt.description, dt.description_hi, dt.description_gu,
             dt.where_to_get, dt.where_to_get_hi, dt.where_to_get_gu,
             dt.accepted_formats, dt.max_size_mb
      FROM service_documents sd
      INNER JOIN document_types dt ON sd.document_type_id = dt.id
      WHERE sd.service_id = ? AND sd.state_id = ? AND sd.is_active = 1 AND dt.is_active = 1
      ORDER BY sd.sort_order
    `).all(serviceId, stateId);

    return NextResponse.json({ documents });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}
