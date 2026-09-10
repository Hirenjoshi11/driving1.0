/**
 * DPDP Security Incident & Data Breach Management Engine
 * 
 * Rules:
 * - Calculate 72-hour board notification timer from detection timestamp.
 * - Manage lifecycle: detected -> contained -> investigated -> impact_assessed -> board_notified -> users_notified -> remediated -> closed.
 * - Generate localized user notifications (English, Gujarati, Hindi) with required safety advisories.
 */

import { getDb } from '@/lib/db';
import { logAudit } from '@/lib/audit';

export async function createSecurityIncident({
  title,
  description,
  severity = 'medium',
  affectedDataCategories = '',
  affectedUserCount = 0,
  createdBy = null,
}) {
  const db = getDb();
  const incidentNumber = `INC-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
  
  // Statutory 72-hour timeline from detection
  const dueAt = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();

  const stmt = await db.prepare(`
    INSERT INTO security_incidents (
      incident_number, title, description, severity, status,
      detected_at, affected_data_categories, affected_user_count,
      board_notification_due_at, created_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, 'detected', datetime('now'), ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  const res = await stmt.run(
    incidentNumber,
    title,
    description,
    severity,
    affectedDataCategories,
    affectedUserCount,
    dueAt,
    createdBy
  );

  await logAudit(db, {
    actorId: createdBy,
    actorRole: 'admin',
    action: 'SECURITY_INCIDENT_CREATED',
    entityType: 'incident',
    entityId: res.lastInsertRowid,
    summary: `Created security incident ${incidentNumber} (${severity})`,
    metadata: { incidentNumber, severity, boardNotificationDueAt: dueAt },
  });

  return { incidentId: res.lastInsertRowid, incidentNumber, boardNotificationDueAt: dueAt };
}

export async function updateIncidentStatus(incidentId, newStatus, actorId, notes = '') {
  const db = getDb();
  const current = await db.prepare('SELECT * FROM security_incidents WHERE id = ?').get(incidentId);
  if (!current) throw new Error('Incident not found');

  let updateFields = 'status = ?, updated_at = datetime(\'now\')';
  const params = [newStatus];

  if (newStatus === 'contained' && !current.contained_at) {
    updateFields += ', contained_at = datetime(\'now\')';
  } else if (newStatus === 'board_notified' && !current.board_notified_at) {
    updateFields += ', board_notified_at = datetime(\'now\')';
  }

  if (notes) {
    updateFields += ', remediation_notes = ?';
    params.push(notes);
  }

  params.push(incidentId);

  await db.prepare(`UPDATE security_incidents SET ${updateFields} WHERE id = ?`).run(...params);

  await logAudit(db, {
    actorId,
    actorRole: 'admin',
    action: 'SECURITY_INCIDENT_STATUS_CHANGE',
    entityType: 'incident',
    entityId: incidentId,
    summary: `Incident ${current.incident_number} transitioned from ${current.status} to ${newStatus}`,
    metadata: { oldStatus: current.status, newStatus, notes },
  });

  return { success: true, status: newStatus };
}
