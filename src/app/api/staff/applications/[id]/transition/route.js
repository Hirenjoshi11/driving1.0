import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { canTransition } from '@/lib/applicationStatus';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const TransitionSchema = z.object({
  to: z.string().min(1),
  reason: z.string().optional(),
  overrideReason: z.string().optional(),
  isOverride: z.boolean().optional(),
  fields: z.record(z.any()).optional()
});

export async function POST(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    // Verify scope (404 if out of jurisdiction)
    if (!isApplicationInScope(db, session, id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = TransitionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }

    const { to: targetStatus, reason, overrideReason, isOverride, fields = {} } = parsed.data;
    const isNumeric = !isNaN(Number(id));

    // Fetch current state
    const app = db.prepare(`
      SELECT 
        a.id,
        a.application_number,
        a.status,
        a.payment_status,
        a.assigned_operator_id,
        a.service_id,
        a.state_id
      FROM applications a
      WHERE ${isNumeric ? 'a.id = ?' : 'a.application_number = ?'}
    `).get(isNumeric ? Number(id) : String(id));

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Count unverified documents
    const docStats = db.prepare(`
      SELECT 
        COUNT(CASE WHEN sd.is_required = 1 AND (ad.upload_status IS NULL OR ad.upload_status != 'verified') THEN 1 END) as unverified_required,
        COUNT(CASE WHEN ad.upload_status = 'rejected' THEN 1 END) as rejected_count
      FROM service_documents sd
      LEFT JOIN application_documents ad ON ad.document_type_id = sd.document_type_id AND ad.application_id = ?
      WHERE sd.service_id = ? AND sd.state_id = ? AND sd.is_active = 1
    `).get(app.id, app.service_id, app.state_id);

    const context = {
      payment_status: app.payment_status,
      unverifiedDocumentCount: docStats ? docStats.unverified_required : 0,
      hasRejectedDocuments: docStats ? docStats.rejected_count > 0 : false,
      currentUserId: session.userId,
      assigned_operator_id: app.assigned_operator_id,
      operator_id: fields.operator_id || app.assigned_operator_id,
      correction_reason: reason || fields.correction_reason,
      government_application_number: fields.government_application_number,
      isOverride: Boolean(isOverride),
      override_reason: overrideReason
    };

    // State machine check
    const check = canTransition(session.role, app.status, targetStatus, context);
    if (!check.allowed) {
      return NextResponse.json({
        error: check.reason || `Transition from ${app.status} to ${targetStatus} is not permitted`
      }, { status: 422 });
    }

    // Execute state change atomically in transaction
    const executeTransition = db.transaction(() => {
      let updateSql = 'UPDATE applications SET status = ?, updated_at = datetime(\'now\')';
      const updateParams = [targetStatus];

      if (targetStatus === 'assigned') {
        updateSql += ', assigned_operator_id = ?, assigned_at = datetime(\'now\')';
        updateParams.push(context.operator_id || session.userId);
      } else if (targetStatus === 'correction_required') {
        updateSql += ', correction_reason = ?, correction_requested_at = datetime(\'now\'), correction_count = correction_count + 1';
        updateParams.push(context.correction_reason);
      } else if (targetStatus === 'completed' && context.government_application_number) {
        updateSql += ', government_application_number = ?';
        updateParams.push(context.government_application_number);
      }

      updateSql += ' WHERE id = ?';
      updateParams.push(app.id);

      db.prepare(updateSql).run(...updateParams);

      // Status history row
      const historyReason = isOverride ? `[ADMIN OVERRIDE] ${overrideReason}` : (reason || null);
      db.prepare(`
        INSERT INTO application_status_history (
          application_id, from_status, to_status, changed_by, reason, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        app.id,
        app.status,
        targetStatus,
        session.userId,
        historyReason,
        fields.notes || null
      );

      // Audit Log
      logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: isOverride ? 'application.status_override' : 'application.status_transition',
        entityType: 'application',
        entityId: app.id,
        summary: `Transitioned application ${app.application_number} from ${app.status} to ${targetStatus}`,
        metadata: {
          application_number: app.application_number,
          from_status: app.status,
          to_status: targetStatus,
          isOverride: Boolean(isOverride),
          reason: historyReason
        }
      });
    });

    executeTransition();

    return NextResponse.json({
      success: true,
      message: `Status transitioned to ${targetStatus}`,
      application_id: app.id,
      from_status: app.status,
      to_status: targetStatus
    });
  } catch (error) {
    console.error('Transition API error:', error);
    return NextResponse.json({ error: 'Failed to execute status transition' }, { status: 500 });
  }
}
