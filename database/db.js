const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.VERCEL 
  ? path.join('/tmp', 'driving_license.db')
  : path.join(process.cwd(), 'database', 'driving_license.db');

let db;

function getDb() {
  if (!db) {
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Check if tables exist and have data
    const tableCheck = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='states'").get();
    let hasData = false;
    if (tableCheck && tableCheck.count > 0) {
      const stateCount = db.prepare("SELECT count(*) as count FROM states").get();
      hasData = stateCount && stateCount.count > 0;
    }
    
    if (!hasData) {
      initializeDatabase();
    }

    // Check if DPDP tables exist and are initialized
    const dpdpCheck = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='data_inventory'").get();
    let hasDpdpData = false;
    if (dpdpCheck && dpdpCheck.count > 0) {
      const invCount = db.prepare("SELECT count(*) as count FROM data_inventory").get();
      hasDpdpData = invCount && invCount.count > 0;
    }

    if (!hasDpdpData) {
      initializeDpdpDatabase();
    }

    // Check if privacy_policy_sections exists and has data
    try {
      const sectionTableCheck = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='privacy_policy_sections'").get();
      if (!sectionTableCheck || sectionTableCheck.count === 0) {
        const { seedPrivacySections } = require('./seed_privacy_sections');
        seedPrivacySections();
      } else {
        const secCount = db.prepare("SELECT count(*) as count FROM privacy_policy_sections").get();
        if (!secCount || secCount.count === 0) {
          const { seedPrivacySections } = require('./seed_privacy_sections');
          seedPrivacySections();
        }
      }
    } catch (e) {
      console.warn('Error checking privacy_policy_sections table:', e.message);
    }

    // Ensure payment_orders table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS payment_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id TEXT UNIQUE NOT NULL,
        application_id INTEGER NOT NULL,
        user_id INTEGER,
        state_id INTEGER,
        service_id INTEGER,
        government_fee REAL NOT NULL,
        service_fee REAL NOT NULL,
        gateway_fee REAL NOT NULL,
        discount REAL DEFAULT 0,
        total_amount REAL NOT NULL,
        currency TEXT DEFAULT 'INR',
        status TEXT DEFAULT 'created',
        payment_method TEXT,
        gateway_reference TEXT,
        idempotency_key TEXT UNIQUE,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (application_id) REFERENCES applications(id)
      );
      CREATE INDEX IF NOT EXISTS idx_payment_orders_app ON payment_orders(application_id);
      CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);
    `);

    // In-app notifications (citizen-facing). Store a translation KEY + params,
    // never a baked English sentence, so the citizen reads it in their language.
    db.exec(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        application_id INTEGER,
        type TEXT NOT NULL,
        title_key TEXT NOT NULL,
        body_key TEXT NOT NULL,
        params TEXT,
        read_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (application_id) REFERENCES applications(id)
      );
      CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);
      CREATE INDEX IF NOT EXISTS idx_notifications_app ON notifications(application_id);
    `);

    // OTP relay requests. E2E by design: the plaintext OTP NEVER lands here.
    // The citizen's app encrypts the code to operator_public_key before it
    // leaves the device; only ciphertext is stored, and it is purged on use or
    // expiry. There is deliberately no plaintext column.
    db.exec(`
      CREATE TABLE IF NOT EXISTS otp_relay_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        application_id INTEGER NOT NULL,
        citizen_user_id INTEGER NOT NULL,
        requested_by INTEGER NOT NULL,
        operator_public_key TEXT NOT NULL,
        ciphertext TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        expires_at TEXT NOT NULL,
        fulfilled_at TEXT,
        cleared_at TEXT,
        FOREIGN KEY (application_id) REFERENCES applications(id),
        FOREIGN KEY (citizen_user_id) REFERENCES users(id),
        FOREIGN KEY (requested_by) REFERENCES users(id)
      );
      CREATE INDEX IF NOT EXISTS idx_otp_relay_app ON otp_relay_requests(application_id, status);
    `);

    // Timestamp for "an operator has started filling this form", surfaced to
    // the citizen. Added via ALTER because applications predates it; guarded so
    // it runs once.
    const appCols = db.prepare("PRAGMA table_info(applications)").all();
    if (!appCols.some((c) => c.name === 'fill_started_at')) {
      db.exec("ALTER TABLE applications ADD COLUMN fill_started_at TEXT");
    }
  }
  return db;
}

function initializeDatabase() {
  const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
  const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }
  
  if (fs.existsSync(seedPath)) {
    const seed = fs.readFileSync(seedPath, 'utf-8');
    db.exec(seed);
  }
}

function initializeDpdpDatabase() {
  const dpdpSchemaPath = path.join(process.cwd(), 'database', 'dpdp_schema.sql');
  const dpdpSeedPath = path.join(process.cwd(), 'database', 'dpdp_seed.sql');

  if (fs.existsSync(dpdpSchemaPath)) {
    const dpdpSchema = fs.readFileSync(dpdpSchemaPath, 'utf-8');
    db.exec(dpdpSchema);
  }

  if (fs.existsSync(dpdpSeedPath)) {
    const dpdpSeed = fs.readFileSync(dpdpSeedPath, 'utf-8');
    db.exec(dpdpSeed);
  }
}

const crypto = require('crypto');

function generateApplicationNumber(stateCode, serviceId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(crypto.randomInt(0, 100000)).padStart(5, '0');
  return `DLF-${stateCode}-${year}${month}-${random}`;
}

module.exports = { getDb, generateApplicationNumber };
