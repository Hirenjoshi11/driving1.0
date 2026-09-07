/**
 * DPDP Consent Engine
 * 
 * Rules:
 * - Never overwrite historical consent events (immutable audit trail).
 * - Keep current consent status in `consents` table.
 * - Log every grant, withdrawal, renewal, or superseding event in `consent_events`.
 */

import { getDb } from '@/lib/db';

/**
 * Get all consent statuses for a specific user.
 * 
 * @param {number} userId
 * @returns {Array<object>}
 */
export function getUserConsents(userId) {
  if (!userId) return [];
  const db = getDb();
  return db.prepare(`
    SELECT c.*, p.code as purpose_code, p.name as purpose_name, 
           p.name_hi as purpose_name_hi, p.name_gu as purpose_name_gu,
           p.description as purpose_description, p.legal_basis, p.is_mandatory
    FROM processing_purposes p
    LEFT JOIN consents c ON c.purpose_id = p.id AND c.user_id = ?
    WHERE p.is_active = 1
    ORDER BY p.is_mandatory DESC, p.id ASC
  `).all(Number(userId));
}

/**
 * Record a user's consent choice (grant or withdraw) for a specific purpose.
 * 
 * @param {{
 *   userId: number,
 *   purposeCodeOrId: string|number,
 *   action: 'grant'|'withdraw',
 *   noticeVersionId?: number,
 *   language?: string,
 *   source?: string,
 *   ipAddress?: string,
 *   deviceRef?: string,
 *   reason?: string
 * }} options
 */
export function recordConsentChoice({
  userId,
  purposeCodeOrId,
  action,
  noticeVersionId = 1,
  language = 'en',
  source = 'privacy_center',
  ipAddress = null,
  deviceRef = null,
  reason = null,
}) {
  const db = getDb();

  // Resolve purpose
  let purpose;
  if (typeof purposeCodeOrId === 'number' || !isNaN(Number(purposeCodeOrId))) {
    purpose = db.prepare('SELECT * FROM processing_purposes WHERE id = ?').get(Number(purposeCodeOrId));
  } else {
    purpose = db.prepare('SELECT * FROM processing_purposes WHERE code = ?').get(String(purposeCodeOrId));
  }

  if (!purpose) {
    throw new Error(`Processing purpose '${purposeCodeOrId}' not found`);
  }

  if (purpose.is_mandatory && action === 'withdraw') {
    throw new Error('Mandatory statutory purpose cannot be withdrawn while using active service.');
  }

  const status = action === 'grant' ? 'granted' : 'withdrawn';
  const now = new Date().toISOString();
  const withdrawnAt = action === 'withdraw' ? now : null;

  const tx = db.transaction(() => {
    // 1. Upsert into consents table
    const existing = db.prepare('SELECT id FROM consents WHERE user_id = ? AND purpose_id = ?').get(userId, purpose.id);
    let consentId;

    if (existing) {
      db.prepare(`
        UPDATE consents
        SET notice_version_id = ?,
            language = ?,
            consent_status = ?,
            timestamp = datetime('now'),
            source = ?,
            ip_address = ?,
            device_ref = ?,
            withdrawn_at = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        noticeVersionId,
        language,
        status,
        source,
        ipAddress,
        deviceRef,
        withdrawnAt,
        existing.id
      );
      consentId = existing.id;
    } else {
      const res = db.prepare(`
        INSERT INTO consents (
          user_id, purpose_id, notice_version_id, language, consent_status,
          timestamp, source, ip_address, device_ref, withdrawn_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, datetime('now'), datetime('now'))
      `).run(
        userId,
        purpose.id,
        noticeVersionId,
        language,
        status,
        source,
        ipAddress,
        deviceRef,
        withdrawnAt
      );
      consentId = res.lastInsertRowid;
    }

    // 2. Append immutable consent event log (Never delete or overwrite!)
    db.prepare(`
      INSERT INTO consent_events (
        consent_id, user_id, purpose_id, notice_version_id, language, action,
        reason, ip_address, device_ref, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      consentId,
      userId,
      purpose.id,
      noticeVersionId,
      language,
      action,
      reason,
      ipAddress,
      deviceRef
    );

    return { consentId, status, purposeCode: purpose.code };
  });

  return tx();
}

/**
 * Check whether a user has active consent for a purpose.
 * 
 * @param {number} userId
 * @param {string} purposeCode
 * @returns {boolean}
 */
export function hasActiveConsent(userId, purposeCode) {
  if (!userId || !purposeCode) return false;
  const db = getDb();
  const row = db.prepare(`
    SELECT c.consent_status, p.legal_basis, p.is_mandatory
    FROM processing_purposes p
    LEFT JOIN consents c ON c.purpose_id = p.id AND c.user_id = ?
    WHERE p.code = ?
  `).get(userId, purposeCode);

  if (!row) return false;
  // If lawful basis is legal_requirement or legitimate_use, consent is not the barrier
  if (row.legal_basis === 'legal_requirement') return true;
  return row.consent_status === 'granted';
}
