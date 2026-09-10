import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
const { getDb } = require('@/lib/db');

export async function GET(request) {
  try {
    const session = await getSessionUser(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Admin authorization required' }, { status: 403 });
    }

    const db = getDb();
    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get('days') || '30'; // 7, 30, 90, all
    const daysLimit = parseInt(dateRange, 10);

    const dateFilter = !isNaN(daysLimit) && daysLimit > 0
      ? `AND created_at >= datetime('now', '-${daysLimit} days')`
      : '';

    // 1. Volume by Status
    const statusCounts = await db.prepare(`
      SELECT status, COUNT(*) as count 
      FROM applications 
      WHERE 1=1 ${dateFilter}
      GROUP BY status
    `).all();

    // 2. Volume by State
    const stateCounts = await db.prepare(`
      SELECT s.id, s.name, s.code, COUNT(a.id) as count
      FROM states s
      LEFT JOIN applications a ON a.state_id = s.id ${dateFilter ? dateFilter.replace('created_at', 'a.created_at') : ''}
      GROUP BY s.id
      ORDER BY count DESC
    `).all();

    // 3. Volume by Service
    const serviceCounts = await db.prepare(`
      SELECT ls.id, ls.name, ls.slug as code, COUNT(a.id) as count
      FROM licence_services ls
      LEFT JOIN applications a ON a.service_id = ls.id ${dateFilter ? dateFilter.replace('created_at', 'a.created_at') : ''}
      GROUP BY ls.id
      ORDER BY count DESC
    `).all();

    // 4. Overdue SLA count
    const overdueCount = (await db.prepare(`
      SELECT COUNT(*) as count
      FROM applications
      WHERE sla_due_at IS NOT NULL 
        AND sla_due_at < datetime('now') 
        AND status NOT IN ('completed', 'draft')
    `).get())?.count || 0;

    // 5. Payment Reconciliation
    const paymentStats = await db.prepare(`
      SELECT 
        payment_status,
        COUNT(*) as count,
        COALESCE(SUM(total_payable), 0) as total_amount
      FROM applications
      GROUP BY payment_status
    `).all();

    // 6. Operator Workload
    const operatorWorkloads = await db.prepare(`
      SELECT 
        u.id,
        u.name,
        u.phone,
        u.is_active,
        COUNT(CASE WHEN a.status NOT IN ('completed', 'draft') THEN 1 END) as open_cases,
        COUNT(CASE WHEN a.status = 'completed' AND date(a.updated_at) = date('now') THEN 1 END) as completed_today,
        MIN(CASE WHEN a.status NOT IN ('completed', 'draft') THEN a.created_at END) as oldest_case_date
      FROM users u
      LEFT JOIN applications a ON a.assigned_operator_id = u.id
      WHERE u.role = 'operator'
      GROUP BY u.id
      ORDER BY open_cases DESC
    `).all();

    // Compute oldest case age in hours
    const enrichedWorkloads = operatorWorkloads.map(op => ({
      ...op,
      oldest_case_age_hours: op.oldest_case_date
        ? Math.max(0, Math.floor((Date.now() - new Date(op.oldest_case_date).getTime()) / (1000 * 60 * 60)))
        : 0
    }));

    // 7. Recent Audit Activity
    const recentAudit = await db.prepare(`
      SELECT al.id, al.action, al.entity_type, al.entity_id, al.summary, al.created_at, u.name as actor_name
      FROM audit_log al
      LEFT JOIN users u ON al.actor_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `).all();

    // 8. Total Summary KPI
    const totalApps = (await db.prepare(`SELECT COUNT(*) as total FROM applications WHERE 1=1 ${dateFilter}`).get())?.total || 0;
    const completedApps = (await db.prepare(`SELECT COUNT(*) as count FROM applications WHERE status = 'completed' ${dateFilter}`).get())?.count || 0;
    const pendingReviewApps = (await db.prepare(`SELECT COUNT(*) as count FROM applications WHERE status IN ('submitted', 'resubmitted', 'under_review')`).get())?.count || 0;

    return NextResponse.json({
      summary: {
        totalApplications: totalApps,
        completedApplications: completedApps,
        pendingReviewApplications: pendingReviewApps,
        overdueApplications: overdueCount
      },
      statusDistribution: statusCounts,
      stateDistribution: stateCounts,
      serviceDistribution: serviceCounts,
      payments: paymentStats,
      operators: enrichedWorkloads,
      recentActivity: recentAudit
    });
  } catch (error) {
    console.error('Admin stats API error:', error);
    return NextResponse.json({ error: 'Failed to retrieve administrative statistics' }, { status: 500 });
  }
}
