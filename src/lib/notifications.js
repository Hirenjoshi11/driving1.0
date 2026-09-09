/**
 * In-app notifications.
 *
 * Notifications store a translation KEY + JSON params, never a baked English
 * sentence, so the citizen reads each one in their own language. Rendering
 * happens client-side through the same t() used everywhere else.
 */
const { getDb } = require('./db');

/**
 * Create a notification for a user.
 *
 * @param {object} db          - an open better-sqlite3 handle (pass the caller's)
 * @param {object} n
 * @param {number} n.userId
 * @param {number} [n.applicationId]
 * @param {string} n.type      - stable machine key, e.g. 'fill_started'
 * @param {string} n.titleKey  - i18n key, e.g. 'notifications.fillStarted.title'
 * @param {string} n.bodyKey   - i18n key, e.g. 'notifications.fillStarted.body'
 * @param {object} [n.params]  - interpolation params for the body, e.g. { appNo }
 */
function createNotification(db, { userId, applicationId = null, type, titleKey, bodyKey, params = null }) {
  if (!db) db = getDb();
  if (!userId || !type || !titleKey || !bodyKey) {
    throw new Error('createNotification requires userId, type, titleKey, bodyKey');
  }
  return db
    .prepare(
      `INSERT INTO notifications (user_id, application_id, type, title_key, body_key, params)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, applicationId, type, titleKey, bodyKey, params ? JSON.stringify(params) : null);
}

function listForUser(db, userId, { limit = 30 } = {}) {
  if (!db) db = getDb();
  const rows = db
    .prepare(
      `SELECT id, application_id, type, title_key, body_key, params, read_at, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`
    )
    .all(userId, limit);
  return rows.map((r) => ({ ...r, params: r.params ? JSON.parse(r.params) : null }));
}

function unreadCount(db, userId) {
  if (!db) db = getDb();
  const row = db
    .prepare(`SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read_at IS NULL`)
    .get(userId);
  return row ? row.c : 0;
}

function markRead(db, userId, ids = null) {
  if (!db) db = getDb();
  if (Array.isArray(ids) && ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',');
    return db
      .prepare(
        `UPDATE notifications SET read_at = datetime('now')
         WHERE user_id = ? AND read_at IS NULL AND id IN (${placeholders})`
      )
      .run(userId, ...ids);
  }
  return db
    .prepare(`UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL`)
    .run(userId);
}

module.exports = { createNotification, listForUser, unreadCount, markRead };
