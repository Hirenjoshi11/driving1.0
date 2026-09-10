import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const FeeStructureSchema = z.object({
  id: z.number().int().optional(),
  serviceId: z.number().int().positive(),
  stateId: z.number().int().positive(),
  governmentFee: z.number().min(0),
  serviceFee: z.number().min(0),
  smartCardFee: z.number().min(0).default(0),
  testFee: z.number().min(0).default(0),
  gatewayFee: z.number().min(0).default(0),
  lateFee: z.number().min(0).default(0),
  effectiveFrom: z.string().min(10),
  effectiveTo: z.string().nullable().optional(),
  isActive: z.boolean().default(true)
});

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const stateId = searchParams.get('stateId');
    const serviceId = searchParams.get('serviceId');

    let whereSql = 'WHERE 1=1';
    const params = [];

    if (stateId) {
      whereSql += ' AND f.state_id = ?';
      params.push(Number(stateId));
    }
    if (serviceId) {
      whereSql += ' AND f.service_id = ?';
      params.push(Number(serviceId));
    }

    const fees = await db.prepare(`
      SELECT 
        f.*,
        s.name as state_name,
        s.code as state_code,
        ls.name as service_name,
        ls.slug as service_code,
        (f.government_fee + f.service_fee + COALESCE(f.smart_card_fee, 0) + COALESCE(f.test_fee, 0) + COALESCE(f.gateway_fee, 0)) as total_computed_fee
      FROM fee_structure f
      JOIN states s ON f.state_id = s.id
      JOIN licence_services ls ON f.service_id = ls.id
      ${whereSql}
      ORDER BY s.name ASC, ls.name ASC, f.effective_from DESC
    `).all(...params);

    return NextResponse.json({ fees });
  } catch (error) {
    console.error('List fees API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve fee structures' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const body = await request.json();
    const parsed = FeeStructureSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const {
      serviceId, stateId, governmentFee, serviceFee, smartCardFee,
      testFee, gatewayFee, lateFee, effectiveFrom, effectiveTo, isActive
    } = parsed.data;

    // Overlap validation: Ensure no two active rows overlap for same service x state
    if (isActive) {
      const activeOverlap = await db.prepare(`
        SELECT id, effective_from, effective_to 
        FROM fee_structure
        WHERE service_id = ? AND state_id = ? AND is_active = 1
          AND (effective_to IS NULL OR effective_to >= ?)
          AND (? IS NULL OR effective_from <= ?)
      `).get(serviceId, stateId, effectiveFrom, effectiveTo || null, effectiveTo || null);

      if (activeOverlap) {
        return NextResponse.json({
          error: `Fee structure overlaps with active entry #${activeOverlap.id} (from ${activeOverlap.effective_from} to ${activeOverlap.effective_to || 'indefinite'}). End the existing fee structure first.`
        }, { status: 409 });
      }
    }

    const insertFee = await db.prepare(`
      INSERT INTO fee_structure (
        service_id, state_id, government_fee, service_fee, smart_card_fee,
        test_fee, gateway_fee, late_fee, effective_from, effective_to, is_active,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `);

    const result = insertFee.run(
      serviceId, stateId, governmentFee, serviceFee, smartCardFee,
      testFee, gatewayFee, lateFee, effectiveFrom, effectiveTo || null, isActive ? 1 : 0
    );

    await logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'fee.create',
      entityType: 'fee_structure',
      entityId: result.lastInsertRowid,
      summary: `Created fee structure for service ${serviceId}, state ${stateId}`,
      metadata: { serviceId, stateId, governmentFee, serviceFee, effectiveFrom, effectiveTo }
    });

    return NextResponse.json({ success: true, id: result.lastInsertRowid });
  } catch (error) {
    console.error('Create fee API error:', error);
    return NextResponse.json({ error: 'Failed to create fee structure' }, { status: 500 });
  }
}
