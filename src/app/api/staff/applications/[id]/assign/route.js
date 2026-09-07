import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getSessionUser } from '@/lib/auth';
import { isApplicationInScope } from '@/lib/scope';
import { logAudit } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const AssignSchema = z.object({
  operatorId: z.number().int().positive()
});

export async function POST(request, { params }) {
  try {
    const session = await getSessionUser(request);
    if (!session || (session.role !== 'operator' && session.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized staff access' }, { status: 401 });
    }

    const { id } = await params;
    const db = getDb();

    if (!isApplicationInScope(db, session, id)) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = AssignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid operatorId' }, { status: 400 });
    }

    const targetOperatorId = parsed.data.operatorId;

    // Operator can only self-claim
    if (session.role === 'operator' && targetOperatorId !== session.userId) {
      return NextResponse.json({ error: 'Operators may only self-claim cases within their jurisdiction' }, { status: 403 });
    }

    // Verify operator exists
    const operator = db.prepare('SELECT id, name, role, is_active FROM users WHERE id = ?').get(targetOperatorId);
    if (!operator || (operator.role !== 'operator' && operator.role !== 'admin')) {
      return NextResponse.json({ error: 'Target user is not an active staff member' }, { status: 400 });
    }

    const isNumeric = !isNaN(Number(id));
    const app = db.prepare(`
      SELECT id, application_number, status, assigned_operator_id 
      FROM applications 
      WHERE ${isNumeric ? 'id = ?' : 'application_number = ?'}
    `).get(isNumeric ? Number(id) : String(id));

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Run transaction
    const executeAssign = db.transaction(() => {
      // If application is submitted, update status to assigned; otherwise keep status
      const newStatus = app.status === 'submitted' ? 'assigned' : app.status;

      db.prepare(`
        UPDATE applications 
        SET assigned_operator_id = ?, assigned_at = datetime('now'), status = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(targetOperatorId, newStatus, app.id);

      if (newStatus !== app.status) {
        db.prepare(`
          INSERT INTO application_status_history (
            application_id, from_status, to_status, changed_by, reason, created_at
          ) VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).run(app.id, app.status, newStatus, session.userId, `Assigned to ${operator.name} (ID: ${operator.id})`);
      }

      logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'application.assign',
        entityType: 'application',
        entityId: app.id,
        summary: `Assigned application ${app.application_number} to ${operator.name}`,
        metadata: {
          application_number: app.application_number,
          target_operator_id: targetOperatorId,
          operator_name: operator.name
        }
      });
    });

    executeAssign();

    return NextResponse.json({
      success: true,
      message: `Assigned to ${operator.name}`,
      operator_id: targetOperatorId,
      operator_name: operator.name
    });
  } catch (error) {
    console.error('Assign API error:', error);
    return NextResponse.json({ error: 'Failed to assign operator' }, { status: 500 });
  }
}
