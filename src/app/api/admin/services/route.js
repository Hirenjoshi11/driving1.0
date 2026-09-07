import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const UpdateServiceSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(2).optional(),
  name_hi: z.string().optional(),
  name_gu: z.string().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
  sort_order: z.number().int().optional()
});

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');

    if (serviceId) {
      // Get detailed steps & fields for this service
      const service = db.prepare('SELECT * FROM licence_services WHERE id = ?').get(Number(serviceId));
      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 });
      }

      const steps = db.prepare(`
        SELECT * FROM service_steps 
        WHERE service_id = ? 
        ORDER BY step_number ASC
      `).all(Number(serviceId));

      const fields = db.prepare(`
        SELECT sf.*, ss.step_number, ss.title as step_title
        FROM service_fields sf
        JOIN service_steps ss ON sf.step_id = ss.id
        WHERE ss.service_id = ?
        ORDER BY ss.step_number ASC, sf.sort_order ASC
      `).all(Number(serviceId));

      const documents = db.prepare(`
        SELECT sd.*, dt.name as doc_name, dt.code as doc_code, s.name as state_name
        FROM service_documents sd
        JOIN document_types dt ON sd.document_type_id = dt.id
        JOIN states s ON sd.state_id = s.id
        WHERE sd.service_id = ?
        ORDER BY s.name ASC, sd.is_required DESC
      `).all(Number(serviceId));

      return NextResponse.json({
        service,
        steps,
        fields,
        documents
      });
    }

    // List all services with counts
    const services = db.prepare(`
      SELECT 
        ls.*,
        (SELECT COUNT(*) FROM service_steps ss WHERE ss.service_id = ls.id) as step_count,
        (SELECT COUNT(*) FROM service_documents sd WHERE sd.service_id = ls.id) as doc_count,
        (SELECT COUNT(*) FROM applications a WHERE a.service_id = ls.id) as application_count,
        (SELECT COUNT(*) FROM applications a WHERE a.service_id = ls.id AND a.status NOT IN ('completed', 'draft')) as inflight_count
      FROM licence_services ls
      ORDER BY ls.sort_order ASC, ls.id ASC
    `).all();

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Services API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve services' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const body = await request.json();
    const parsed = UpdateServiceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { id, name, name_hi, name_gu, description, is_active, sort_order } = parsed.data;

    const current = db.prepare('SELECT * FROM licence_services WHERE id = ?').get(id);
    if (!current) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    db.prepare(`
      UPDATE licence_services
      SET name = COALESCE(?, name),
          name_hi = COALESCE(?, name_hi),
          name_gu = COALESCE(?, name_gu),
          description = COALESCE(?, description),
          is_active = COALESCE(?, is_active),
          sort_order = COALESCE(?, sort_order),
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      name, name_hi, name_gu, description,
      typeof is_active === 'boolean' ? (is_active ? 1 : 0) : null,
      sort_order, id
    );

    logAudit(db, {
      actorId: session.userId,
      actorRole: session.role,
      action: 'service.update',
      entityType: 'licence_service',
      entityId: id,
      summary: `Updated service configuration "${current.name}"`,
      metadata: { service_id: id, is_active }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update service API error:', error);
    return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
  }
}
