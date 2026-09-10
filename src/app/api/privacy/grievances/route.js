import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rateLimit';

// GET /api/privacy/grievances
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const db = getDb();
    const grievances = await db.prepare(`
      SELECT g.*, 
             (SELECT COUNT(*) FROM grievance_events WHERE grievance_id = g.id) as event_count
      FROM grievances g
      WHERE g.user_id = ?
      ORDER BY g.created_at DESC
    `).all(session.userId);

    return NextResponse.json({ grievances });
  } catch (error) {
    console.error('Error fetching grievances:', error);
    return NextResponse.json({ error: 'Failed to fetch grievances' }, { status: 500 });
  }
}

// POST /api/privacy/grievances
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`grievance_${session.userId}`, 5, 10 * 60 * 1000);
    if (!rateCheck.allowed) {
      return rateLimitExceededResponse(rateCheck.resetTime);
    }

    const body = await request.json();
    const { category, subject, description } = body;

    const validCategories = ['data_access', 'data_correction', 'consent_withdrawal', 'unauthorized_processing', 'security_concern', 'other'];
    if (!category || !validCategories.includes(category)) {
      return NextResponse.json({ error: 'Valid grievance category is required' }, { status: 400 });
    }

    if (!subject || subject.trim().length < 3) {
      return NextResponse.json({ error: 'Subject is required (min 3 chars)' }, { status: 400 });
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json({ error: 'Description is required (min 10 chars)' }, { status: 400 });
    }

    const db = getDb();
    const grievanceNumber = `GRV-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
    
    // Statutory resolution SLA (e.g., 30 days under statutory rules)
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const tx = db.transaction(async () => {
      const res = await db.prepare(`
        INSERT INTO grievances (
          grievance_number, user_id, category, subject, description,
          status, resolution_due_date, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'submitted', ?, datetime('now'), datetime('now'))
      `).run(grievanceNumber, session.userId, category, subject.trim(), description.trim(), dueDate);

      const grievanceId = res.lastInsertRowid;

      await db.prepare(`
        INSERT INTO grievance_events (grievance_id, from_status, to_status, actor_id, actor_role, notes, created_at)
        VALUES (?, NULL, 'submitted', ?, ?, 'Grievance submitted by citizen', datetime('now'))
      `).run(grievanceId, session.userId, session.role);

      await logAudit(db, {
        actorId: session.userId,
        actorRole: session.role,
        action: 'GRIEVANCE_SUBMITTED',
        entityType: 'grievance',
        entityId: grievanceId,
        summary: `Citizen filed grievance ${grievanceNumber} (${category})`,
        ip: clientIp,
      });

      return { grievanceId, grievanceNumber, status: 'submitted', resolutionDueDate: dueDate };
    });

    const result = await tx();
    return NextResponse.json({ success: true, grievance: result }, { status: 201 });
  } catch (error) {
    console.error('Error submitting grievance:', error);
    return NextResponse.json({ error: 'Failed to submit grievance' }, { status: 500 });
  }
}
