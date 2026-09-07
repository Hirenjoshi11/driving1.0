const { getDb } = require('../database/db');
const db = getDb();
const dateFilter = "AND created_at >= datetime('now', '-30 days')";

try {
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) as count 
    FROM applications 
    WHERE 1=1 ${dateFilter}
    GROUP BY status
  `).all();
  console.log('statusCounts OK:', statusCounts);

  const stateCounts = db.prepare(`
    SELECT s.id, s.name, s.code, COUNT(a.id) as count
    FROM states s
    LEFT JOIN applications a ON a.state_id = s.id ${dateFilter ? dateFilter.replace('created_at', 'a.created_at') : ''}
    GROUP BY s.id
    ORDER BY count DESC
  `).all();
  console.log('stateCounts OK:', stateCounts);

  const serviceCounts = db.prepare(`
    SELECT ls.id, ls.name, ls.code, COUNT(a.id) as count
    FROM licence_services ls
    LEFT JOIN applications a ON a.service_id = ls.id ${dateFilter ? dateFilter.replace('created_at', 'a.created_at') : ''}
    GROUP BY ls.id
    ORDER BY count DESC
  `).all();
  console.log('serviceCounts OK:', serviceCounts);

  const overdueCount = db.prepare(`
    SELECT COUNT(*) as count
    FROM applications
    WHERE sla_due_at IS NOT NULL 
      AND sla_due_at < datetime('now') 
      AND status NOT IN ('completed', 'draft')
  `).get()?.count || 0;
  console.log('overdueCount OK:', overdueCount);

  const paymentStats = db.prepare(`
    SELECT 
      payment_status,
      COUNT(*) as count,
      COALESCE(SUM(total_payable), 0) as total_amount
    FROM applications
    GROUP BY payment_status
  `).all();
  console.log('paymentStats OK:', paymentStats);

  const operatorWorkloads = db.prepare(`
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
  console.log('operatorWorkloads OK:', operatorWorkloads);

  const recentAudit = db.prepare(`
    SELECT al.id, al.action, al.entity_type, al.entity_id, al.summary, al.created_at, u.name as actor_name
    FROM audit_log al
    LEFT JOIN users u ON al.actor_id = u.id
    ORDER BY al.created_at DESC
    LIMIT 10
  `).all();
  console.log('recentAudit OK:', recentAudit);
} catch (e) {
  console.error('ERROR OCCURRED:', e);
}
