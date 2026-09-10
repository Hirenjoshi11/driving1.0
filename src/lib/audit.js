/**
 * Audit Logging & PII Sanitization Helper
 * 
 * Rules:
 * - Never log PII into audit_log metadata or server logs.
 * - Every staff mutation (verify doc, transition status, reveal PII, fee update) writes an audit row.
 */

const PII_KEYS = new Set([
  'identity_number',
  'aadhaar',
  'guardian_aadhaar',
  'mobile',
  'phone',
  'guardian_mobile',
  'date_of_birth',
  'dob',
  'email',
  'address',
  'permanent_address',
  'current_address',
  'password'
]);

/**
 * Strips PII keys recursively from any object before storing in audit_log metadata.
 * @param {any} data
 * @returns {any}
 */
export function sanitizeAuditMetadata(data) {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeAuditMetadata(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (PII_KEYS.has(lowerKey) || lowerKey.includes('aadhaar') || lowerKey.includes('secret') || lowerKey.includes('token')) {
      sanitized[key] = '[REDACTED_PII]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeAuditMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Masks Aadhaar / identity_number to "XXXX XXXX 1234".
 * @param {string|null|undefined} num
 * @returns {string}
 */
export function maskAadhaar(num) {
  if (!num) return '—';
  const clean = String(num).replace(/\s+/g, '');
  if (clean.length < 4) return 'XXXX XXXX XXXX';
  const lastFour = clean.slice(-4);
  return `XXXX XXXX ${lastFour}`;
}

/**
 * Masks mobile number to "+91 XXXXX 12345".
 * @param {string|null|undefined} phone
 * @returns {string}
 */
export function maskMobile(phone) {
  if (!phone) return '—';
  const clean = String(phone).replace(/\D/g, '');
  if (clean.length < 5) return 'XXXXX XXXXX';
  const lastFive = clean.slice(-5);
  return `XXXXX ${lastFive}`;
}

/**
 * Writes an audit record to audit_log table.
 * Can be run within an existing better-sqlite3 transaction.
 * 
 * @param {import('better-sqlite3').Database} db
 * @param {{
 *   actorId: number|null,
 *   actorRole: string|null,
 *   action: string,
 *   entityType: string,
 *   entityId?: string|number|null,
 *   summary?: string|null,
 *   metadata?: any,
 *   ip?: string|null
 * }} entry
 */
export async function logAudit(db, {
  actorId = null,
  actorRole = null,
  action,
  entityType,
  entityId = null,
  summary = null,
  metadata = null,
  ip = null
}) {
  if (!action || !entityType) {
    throw new Error('Audit log requires action and entityType');
  }

  const sanitizedMeta = metadata ? JSON.stringify(sanitizeAuditMetadata(metadata)) : null;

  const stmt = await db.prepare(`
    INSERT INTO audit_log (
      actor_id,
      actor_role,
      action,
      entity_type,
      entity_id,
      summary,
      metadata,
      ip,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  await stmt.run(
    actorId ? Number(actorId) : null,
    actorRole ? String(actorRole) : null,
    String(action),
    String(entityType),
    entityId !== null && entityId !== undefined ? String(entityId) : null,
    summary ? String(summary) : null,
    sanitizedMeta,
    ip ? String(ip) : null
  );
}

/**
 * Logs document access events into document_access_logs and audit_log.
 */
export async function logDocumentAccess(db, {
  documentId,
  applicationId,
  actorId,
  actorRole,
  action = 'download',
  ip = null,
  userAgent = null,
}) {
  try {
    await db.prepare(`
      INSERT INTO document_access_logs (
        document_id, application_id, actor_id, actor_role, action, ip_address, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(documentId, applicationId, actorId, actorRole, action, ip, userAgent);

    await logAudit(db, {
      actorId,
      actorRole,
      action: `DOCUMENT_${action.toUpperCase()}`,
      entityType: 'document',
      entityId: documentId,
      summary: `${actorRole} ${actorId} accessed document ${documentId} (app ${applicationId})`,
      ip,
    });
  } catch (err) {
    console.error('Failed to log document access:', err);
  }
}

/**
 * Logs security events (auth failures, permission denials, suspicious rate limit triggers).
 */
export async function logSecurityEvent(db, {
  actorId = null,
  action,
  summary,
  metadata = {},
  ip = null,
}) {
  try {
    await logAudit(db, {
      actorId,
      actorRole: 'system',
      action: `SECURITY_${action.toUpperCase()}`,
      entityType: 'security',
      summary,
      metadata,
      ip,
    });
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

