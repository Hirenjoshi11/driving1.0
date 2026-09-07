import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';

// GET /api/admin/privacy/processors
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const db = getDb();
    const processors = db.prepare(`
      SELECT dp.*, 
             pc.contract_reference, pc.dpa_signed, pc.effective_from, pc.expires_at,
             pc.status as contract_validity
      FROM data_processors dp
      LEFT JOIN processor_contracts pc ON pc.processor_id = dp.id
      ORDER BY dp.is_active DESC, dp.id ASC
    `).all();

    const sharingStats = db.prepare(`
      SELECT recipient, COUNT(*) as count 
      FROM data_sharing_records 
      GROUP BY recipient
    `).all();

    return NextResponse.json({ processors, sharingStats });
  } catch (error) {
    console.error('Error fetching data processors:', error);
    return NextResponse.json({ error: 'Failed to fetch data processors' }, { status: 500 });
  }
}

// POST /api/admin/privacy/processors
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, vendor, serviceType, country, storageLocation, processorStatus, contractReference, dpaSigned, expiresAt } = body;

    if (!name || !code || !vendor) {
      return NextResponse.json({ error: 'Name, code, and vendor are required' }, { status: 400 });
    }

    const db = getDb();
    const tx = db.transaction(() => {
      const res = db.prepare(`
        INSERT INTO data_processors (
          code, name, vendor, service_type, country, storage_location,
          processor_status, contract_status, security_review_status,
          deletion_capability, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', 1, 1, datetime('now'), datetime('now'))
      `).run(
        code.trim(),
        name.trim(),
        vendor.trim(),
        serviceType || 'cloud_hosting',
        country || 'India',
        storageLocation || 'India',
        processorStatus || 'contracted',
        expiresAt ? 'active' : 'pending_review'
      );

      const processorId = res.lastInsertRowid;

      if (contractReference) {
        db.prepare(`
          INSERT INTO processor_contracts (
            processor_id, contract_reference, dpa_signed, effective_from, expires_at, status, created_at, updated_at
          ) VALUES (?, ?, ?, datetime('now'), ?, 'active', datetime('now'), datetime('now'))
        `).run(processorId, contractReference, dpaSigned ? 1 : 0, expiresAt || '2028-12-31');
      }

      logAudit(db, {
        actorId: session.userId,
        actorRole: 'admin',
        action: 'DATA_PROCESSOR_REGISTERED',
        entityType: 'data_processor',
        entityId: processorId,
        summary: `Admin registered data processor ${name} (${code})`,
        metadata: { name, code, vendor },
      });

      return { processorId };
    });

    const result = tx();
    return NextResponse.json({ success: true, processorId: result.processorId }, { status: 201 });
  } catch (error) {
    console.error('Error registering processor:', error);
    return NextResponse.json({ error: error.message || 'Failed to register processor' }, { status: 500 });
  }
}
