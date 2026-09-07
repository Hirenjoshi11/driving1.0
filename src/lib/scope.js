/**
 * Jurisdiction Scoping Helper
 * 
 * Rules:
 * - Admin: no restriction (1=1).
 * - Operator: application must match at least one active operator_assignments row:
 *   state_id must match, and service_id / rto_id must match if specified in assignment row.
 * - If an operator accesses an out-of-jurisdiction application, return 404 (not 403).
 */

/**
 * Fetch all active assignments for an operator.
 * @param {import('better-sqlite3').Database} db
 * @param {number|string} operatorId
 * @returns {Array<{ id: number, state_id: number, service_id: number|null, rto_id: number|null }>}
 */
export function getOperatorAssignments(db, operatorId) {
  if (!operatorId) return [];
  return db.prepare(`
    SELECT id, state_id, service_id, rto_id
    FROM operator_assignments
    WHERE operator_id = ? AND is_active = 1
  `).all(Number(operatorId));
}

/**
 * Generates SQL WHERE clause snippet and bound parameter array based on session user.
 * @param {import('better-sqlite3').Database} db
 * @param {{ role: string, userId: number|string }} session
 * @param {string} [tableAlias='a']
 * @returns {{ sql: string, params: Array<number|string> }}
 */
export function scopeClause(db, session, tableAlias = 'a') {
  if (!session) {
    return { sql: '1=0', params: [] };
  }

  if (session.role === 'admin') {
    return { sql: '1=1', params: [] };
  }

  if (session.role === 'operator') {
    const assignments = getOperatorAssignments(db, session.userId);
    if (!assignments || assignments.length === 0) {
      // Operator has no assigned jurisdictions; deny access to all records
      return { sql: '1=0', params: [] };
    }

    const conditions = [];
    const params = [];
    const prefix = tableAlias ? `${tableAlias}.` : '';

    for (const row of assignments) {
      const parts = [`${prefix}state_id = ?`];
      params.push(row.state_id);

      if (row.service_id !== null && row.service_id !== undefined) {
        parts.push(`${prefix}service_id = ?`);
        params.push(row.service_id);
      }

      if (row.rto_id !== null && row.rto_id !== undefined) {
        parts.push(`${prefix}rto_id = ?`);
        params.push(row.rto_id);
      }

      conditions.push(`(${parts.join(' AND ')})`);
    }

    return {
      sql: `(${conditions.join(' OR ')})`,
      params
    };
  }

  return { sql: '1=0', params: [] };
}

/**
 * Checks whether an application is within the session user's scope.
 * @param {import('better-sqlite3').Database} db
 * @param {{ role: string, userId: number|string }} session
 * @param {number|string} applicationId - id or application_number
 * @returns {boolean}
 */
export function isApplicationInScope(db, session, applicationId) {
  if (!session || !applicationId) return false;
  if (session.role === 'admin') return true;
  if (session.role !== 'operator') return false;

  const { sql: scopeSql, params: scopeParams } = scopeClause(db, session, 'a');
  const isNumeric = !isNaN(Number(applicationId));

  const query = `
    SELECT a.id
    FROM applications a
    WHERE ${isNumeric ? 'a.id = ?' : 'a.application_number = ?'}
      AND ${scopeSql}
    LIMIT 1
  `;

  const match = db.prepare(query).get(isNumeric ? Number(applicationId) : String(applicationId), ...scopeParams);
  return Boolean(match);
}
