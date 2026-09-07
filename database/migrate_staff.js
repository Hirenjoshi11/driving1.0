const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'driving_license.db');
const db = new Database(dbPath);

console.log('Running staff portal migration on:', dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_id INTEGER,
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    summary TEXT,
    metadata TEXT,
    ip TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (actor_id) REFERENCES users(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);
`);

const appCols = db.prepare("PRAGMA table_info(applications)").all().map(c => c.name);
if (!appCols.includes('assigned_at')) {
  db.exec("ALTER TABLE applications ADD COLUMN assigned_at TEXT;");
  console.log('Added assigned_at column to applications');
} else {
  console.log('applications.assigned_at already exists');
}

if (!appCols.includes('sla_due_at')) {
  db.exec("ALTER TABLE applications ADD COLUMN sla_due_at TEXT;");
  console.log('Added sla_due_at column to applications');
} else {
  console.log('applications.sla_due_at already exists');
}

console.log('Migration completed successfully.');
