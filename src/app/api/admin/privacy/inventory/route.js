import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';

// GET /api/admin/privacy/inventory
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const sensitivity = searchParams.get('sensitivity');

    const db = getDb();
    let query = 'SELECT * FROM data_inventory WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND data_category = ?';
      params.push(category);
    }
    if (sensitivity) {
      query += ' AND sensitivity_level = ?';
      params.push(sensitivity);
    }

    query += ' ORDER BY sensitivity_level DESC, field_name ASC';
    const items = await db.prepare(query).all(...params);

    return NextResponse.json({ inventory: items });
  } catch (error) {
    console.error('Error fetching data inventory:', error);
    return NextResponse.json({ error: 'Failed to fetch data inventory' }, { status: 500 });
  }
}

// PUT /api/admin/privacy/inventory
export async function PUT(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = await request.json();
    const { fieldId, legalBasis, sensitivityLevel, erasable, correctable } = body;

    if (!fieldId) {
      return NextResponse.json({ error: 'Field ID is required' }, { status: 400 });
    }

    const db = getDb();
    await db.prepare(`
      UPDATE data_inventory
      SET legal_basis = COALESCE(?, legal_basis),
          sensitivity_level = COALESCE(?, sensitivity_level),
          erasable = COALESCE(?, erasable),
          correctable = COALESCE(?, correctable),
          updated_at = datetime('now')
      WHERE field_id = ?
    `).run(legalBasis, sensitivityLevel, erasable, correctable, fieldId);

    await logAudit(db, {
      actorId: session.userId,
      actorRole: 'admin',
      action: 'DATA_INVENTORY_UPDATED',
      entityType: 'data_inventory',
      entityId: fieldId,
      summary: `Admin updated field configuration for ${fieldId}`,
      metadata: { fieldId, legalBasis, sensitivityLevel },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return NextResponse.json({ error: 'Failed to update inventory' }, { status: 500 });
  }
}
