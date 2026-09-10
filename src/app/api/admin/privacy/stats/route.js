import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Access restricted to administrators' }, { status: 403 });
    }

    const db = getDb();

    // 1. Pending Privacy Requests
    const openRequestsCount = (await db.prepare(`
      SELECT COUNT(*) as count FROM privacy_requests 
      WHERE status NOT IN ('completed', 'rejected')
    `).get())?.count || 0;

    // 2. Active Incidents & 72-hr timers
    const activeIncidents = (await db.prepare(`
      SELECT COUNT(*) as count FROM security_incidents 
      WHERE status NOT IN ('remediated', 'closed')
    `).get())?.count || 0;

    // 3. Processors needing review or missing contract
    const processorAlerts = (await db.prepare(`
      SELECT COUNT(*) as count FROM data_processors 
      WHERE processor_status IN ('missing_contract', 'review_required') OR contract_status != 'active'
    `).get())?.count || 0;

    // 4. Open Grievances
    const openGrievancesCount = (await db.prepare(`
      SELECT COUNT(*) as count FROM grievances 
      WHERE status NOT IN ('resolved', 'closed')
    `).get())?.count || 0;

    // 5. Active Legal Holds
    const activeHoldsCount = (await db.prepare(`
      SELECT COUNT(*) as count FROM legal_holds 
      WHERE is_active = 1
    `).get())?.count || 0;

    // 6. Consent Metrics
    const consentStats = await db.prepare(`
      SELECT consent_status, COUNT(*) as count 
      FROM consents 
      GROUP BY consent_status
    `).all();

    // 7. Critical Compliance Alerts List
    const alerts = [];

    // Check overdue privacy requests (> 30 days)
    const overdueRequests = await db.prepare(`
      SELECT id, request_number, request_type, created_at 
      FROM privacy_requests 
      WHERE status NOT IN ('completed', 'rejected') 
        AND datetime(created_at, '+30 days') < datetime('now')
    `).all();

    if (overdueRequests.length > 0) {
      alerts.push({
        type: 'critical',
        code: 'OVERDUE_PRIVACY_REQUESTS',
        message: `${overdueRequests.length} Data Principal request(s) exceeding 30-day statutory resolution timeline.`,
        count: overdueRequests.length,
      });
    }

    // Check incidents pending board notification (< 24h remaining or overdue)
    const urgentIncidents = await db.prepare(`
      SELECT id, incident_number, board_notification_due_at 
      FROM security_incidents 
      WHERE status IN ('detected', 'contained', 'investigating')
        AND board_notified_at IS NULL
    `).all();

    for (const inc of urgentIncidents) {
      const remainingMs = new Date(inc.board_notification_due_at).getTime() - Date.now();
      const remainingHours = Math.round(remainingMs / (1000 * 60 * 60));
      alerts.push({
        type: remainingHours <= 24 ? 'critical' : 'warning',
        code: 'BOARD_NOTIFICATION_TIMER',
        message: `Security incident ${inc.incident_number}: 72-hour board reporting deadline has ${remainingHours > 0 ? remainingHours + ' hours remaining' : 'EXPIRED!'}`,
        incidentId: inc.id,
      });
    }

    if (processorAlerts > 0) {
      alerts.push({
        type: 'warning',
        code: 'PROCESSOR_CONTRACT_ALERT',
        message: `${processorAlerts} data processor(s) have missing contracts or pending security reviews.`,
        count: processorAlerts,
      });
    }

    return NextResponse.json({
      metrics: {
        openRequestsCount,
        activeIncidents,
        processorAlerts,
        openGrievancesCount,
        activeHoldsCount,
        consentStats,
      },
      alerts,
    });
  } catch (error) {
    console.error('Error loading admin privacy stats:', error);
    return NextResponse.json({ error: 'Failed to load privacy metrics' }, { status: 500 });
  }
}
