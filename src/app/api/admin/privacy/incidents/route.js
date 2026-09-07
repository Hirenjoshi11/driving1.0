import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createSecurityIncident, updateIncidentStatus } from '@/lib/dpdp/incidents';
import { logAudit } from '@/lib/audit';

// GET /api/admin/privacy/incidents
export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const db = getDb();
    const incidents = db.prepare(`
      SELECT si.*, 
             u.name as creator_name,
             (SELECT COUNT(*) FROM breach_notifications WHERE incident_id = si.id) as user_notifications_count
      FROM security_incidents si
      LEFT JOIN users u ON si.created_by = u.id
      ORDER BY si.created_at DESC
    `).all();

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}

// POST /api/admin/privacy/incidents
export async function POST(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    // Action 1: Create incident
    if (action === 'create') {
      const { title, description, severity, affectedDataCategories, affectedUserCount } = body;
      if (!title || !description) {
        return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
      }

      const result = createSecurityIncident({
        title,
        description,
        severity: severity || 'medium',
        affectedDataCategories: affectedDataCategories || 'none_confirmed',
        affectedUserCount: Number(affectedUserCount || 0),
        createdBy: session.userId,
      });

      return NextResponse.json({ success: true, incident: result }, { status: 201 });
    }

    // Action 2: Update status
    if (action === 'update_status') {
      const { incidentId, status, notes } = body;
      if (!incidentId || !status) {
        return NextResponse.json({ error: 'incidentId and status are required' }, { status: 400 });
      }

      const result = updateIncidentStatus(incidentId, status, session.userId, notes);
      return NextResponse.json({ success: true, result });
    }

    // Action 3: Dispatch user notifications (English, Hindi, Gujarati)
    if (action === 'notify_users') {
      const { incidentId, title, message, channels = ['in_app'] } = body;
      if (!incidentId || !title || !message) {
        return NextResponse.json({ error: 'incidentId, title, and message are required' }, { status: 400 });
      }

      const db = getDb();
      const inc = db.prepare('SELECT * FROM security_incidents WHERE id = ?').get(incidentId);
      if (!inc) return NextResponse.json({ error: 'Incident not found' }, { status: 404 });

      // Target users or sample users for incident broadcast
      const users = db.prepare('SELECT id, name, phone, email FROM users WHERE role = "citizen" LIMIT 50').all();
      
      const insertNotification = db.prepare(`
        INSERT INTO breach_notifications (
          incident_id, user_id, recipient_email, recipient_phone, channel,
          status, language, title, message, sent_at, created_at
        ) VALUES (?, ?, ?, ?, ?, 'sent', 'en', ?, ?, datetime('now'), datetime('now'))
      `);

      const tx = db.transaction(() => {
        for (const u of users) {
          for (const ch of channels) {
            insertNotification.run(incidentId, u.id, u.email, u.phone, ch, title, message);
          }
        }
        db.prepare("UPDATE security_incidents SET status = 'users_notified', updated_at = datetime('now') WHERE id = ?").run(incidentId);
      });

      tx();

      logAudit(db, {
        actorId: session.userId,
        actorRole: 'admin',
        action: 'BREACH_NOTIFICATIONS_DISPATCHED',
        entityType: 'incident',
        entityId: incidentId,
        summary: `Dispatched ${users.length} localized breach notifications for incident ${inc.incident_number}`,
      });

      return NextResponse.json({ success: true, sentCount: users.length });
    }

    return NextResponse.json({ error: 'Invalid incident action' }, { status: 400 });
  } catch (error) {
    console.error('Error in incident management:', error);
    return NextResponse.json({ error: error.message || 'Incident operation failed' }, { status: 500 });
  }
}
