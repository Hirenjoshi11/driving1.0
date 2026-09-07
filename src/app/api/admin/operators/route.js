import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { getSessionUser } from '@/lib/auth';
import { logAudit, maskMobile } from '@/lib/audit';
const { getDb } = require('@/lib/db');

const CreateOperatorSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/, 'Must be a 10-digit mobile number'),
  email: z.string().email().optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  stateId: z.number().int().optional(),
  assignments: z.array(z.object({
    stateId: z.number().int(),
    serviceId: z.number().int().nullable().optional(),
    rtoId: z.number().int().nullable().optional()
  })).optional()
});

const UpdateOperatorSchema = z.object({
  operatorId: z.number().int(),
  isActive: z.boolean().optional(),
  name: z.string().min(2).optional(),
  reassignToOperatorId: z.number().int().nullable().optional(),
  assignments: z.array(z.object({
    stateId: z.number().int(),
    serviceId: z.number().int().nullable().optional(),
    rtoId: z.number().int().nullable().optional()
  })).optional()
});

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();

    // Fetch operators
    const operators = db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.phone,
        u.email,
        u.role,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(CASE WHEN a.status NOT IN ('completed', 'draft') THEN 1 END) as open_cases,
        COUNT(CASE WHEN a.status = 'completed' AND date(a.updated_at) = date('now') THEN 1 END) as completed_today
      FROM users u
      LEFT JOIN applications a ON a.assigned_operator_id = u.id
      WHERE u.role IN ('operator', 'admin')
      GROUP BY u.id
      ORDER BY u.role DESC, u.name ASC
    `).all();

    // Fetch all active assignments
    const allAssignments = db.prepare(`
      SELECT 
        oa.id,
        oa.operator_id,
        oa.state_id,
        oa.service_id,
        oa.rto_id,
        oa.is_active,
        s.name as state_name,
        s.code as state_code,
        ls.name as service_name,
        r.rto_code as rto_code,
        r.name as rto_name
      FROM operator_assignments oa
      JOIN states s ON oa.state_id = s.id
      LEFT JOIN licence_services ls ON oa.service_id = ls.id
      LEFT JOIN rto_offices r ON oa.rto_id = r.id
      WHERE oa.is_active = 1
    `).all();

    // Group assignments by operator
    const assignmentMap = {};
    for (const a of allAssignments) {
      if (!assignmentMap[a.operator_id]) {
        assignmentMap[a.operator_id] = [];
      }
      assignmentMap[a.operator_id].push(a);
    }

    const result = operators.map(op => ({
      ...op,
      masked_phone: maskMobile(op.phone),
      assignments: assignmentMap[op.id] || []
    }));

    return NextResponse.json({ operators: result });
  } catch (error) {
    console.error('List operators API error:', error);
    return NextResponse.json({ error: 'Failed to list operators' }, { status: 500 });
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
    const parsed = CreateOperatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { name, phone, email, password, stateId, assignments = [] } = parsed.data;

    // Check if phone or email already exists
    const existing = db.prepare('SELECT id FROM users WHERE phone = ? OR (email IS NOT NULL AND email != \'\' AND email = ?)').get(phone, email || null);
    if (existing) {
      return NextResponse.json({ error: 'A user with this phone or email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createOp = db.transaction(() => {
      const insertUser = db.prepare(`
        INSERT INTO users (name, phone, email, password_hash, role, state_id, is_active, phone_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'operator', ?, 1, 1, datetime('now'), datetime('now'))
      `).run(name, phone, email || null, passwordHash, stateId || null);

      const operatorId = insertUser.lastInsertRowid;

      // Insert jurisdiction assignments
      const insertAssign = db.prepare(`
        INSERT INTO operator_assignments (operator_id, state_id, service_id, rto_id, is_active, created_at)
        VALUES (?, ?, ?, ?, 1, datetime('now'))
      `);

      for (const a of assignments) {
        insertAssign.run(operatorId, a.stateId, a.serviceId || null, a.rtoId || null);
      }

      logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'operator.create',
        entityType: 'operator',
        entityId: operatorId,
        summary: `Created operator account "${name}" with ${assignments.length} assignments`,
        metadata: {
          operator_id: operatorId,
          name,
          phone_masked: maskMobile(phone),
          assignments_count: assignments.length
        }
      });

      return operatorId;
    });

    const newOperatorId = createOp();

    return NextResponse.json({
      success: true,
      message: 'Operator account created successfully',
      operatorId: newOperatorId
    });
  } catch (error) {
    console.error('Create operator API error:', error);
    return NextResponse.json({ error: 'Failed to create operator account' }, { status: 500 });
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
    const parsed = UpdateOperatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const { operatorId, isActive, name, reassignToOperatorId, assignments } = parsed.data;

    const op = db.prepare('SELECT id, name, is_active FROM users WHERE id = ?').get(operatorId);
    if (!op) {
      return NextResponse.json({ error: 'Operator not found' }, { status: 404 });
    }

    const updateOp = db.transaction(() => {
      // Update name or status if provided
      if (typeof isActive === 'boolean' || name) {
        const newActive = typeof isActive === 'boolean' ? (isActive ? 1 : 0) : op.is_active;
        const newName = name || op.name;

        db.prepare('UPDATE users SET is_active = ?, name = ?, updated_at = datetime(\'now\') WHERE id = ?')
          .run(newActive, newName, operatorId);

        // If deactivating, reassign open cases or unassign them (never silently strand work)
        if (typeof isActive === 'boolean' && !isActive) {
          if (reassignToOperatorId) {
            db.prepare(`
              UPDATE applications 
              SET assigned_operator_id = ?, updated_at = datetime('now')
              WHERE assigned_operator_id = ? AND status NOT IN ('completed', 'draft')
            `).run(reassignToOperatorId, operatorId);
          } else {
            // Orphan cases cleanly back to 'submitted' or unassigned
            db.prepare(`
              UPDATE applications 
              SET assigned_operator_id = NULL, status = CASE WHEN status = 'assigned' THEN 'submitted' ELSE status END, updated_at = datetime('now')
              WHERE assigned_operator_id = ? AND status NOT IN ('completed', 'draft')
            `).run(operatorId);
          }
        }
      }

      // Replace assignments if provided
      if (assignments && Array.isArray(assignments)) {
        db.prepare('DELETE FROM operator_assignments WHERE operator_id = ?').run(operatorId);
        const insertAssign = db.prepare(`
          INSERT INTO operator_assignments (operator_id, state_id, service_id, rto_id, is_active, created_at)
          VALUES (?, ?, ?, ?, 1, datetime('now'))
        `);

        for (const a of assignments) {
          insertAssign.run(operatorId, a.stateId, a.serviceId || null, a.rtoId || null);
        }
      }

      logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'operator.update',
        entityType: 'operator',
        entityId: operatorId,
        summary: `Updated operator ${op.name} (Active: ${isActive ?? op.is_active})`,
        metadata: {
          operator_id: operatorId,
          is_active: isActive,
          reassigned_to: reassignToOperatorId || null
        }
      });
    });

    updateOp();

    return NextResponse.json({ success: true, message: 'Operator updated successfully' });
  } catch (error) {
    console.error('Update operator API error:', error);
    return NextResponse.json({ error: 'Failed to update operator' }, { status: 500 });
  }
}
