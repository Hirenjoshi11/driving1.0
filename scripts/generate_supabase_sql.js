const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');

let schema = fs.readFileSync(schemaPath, 'utf8');
let seed = fs.readFileSync(seedPath, 'utf8');

// Convert SQLite schema to PostgreSQL
let pgSchema = schema
  .replace(/INTEGER PRIMARY KEY AUTOINCREMENT/gi, 'SERIAL PRIMARY KEY')
  .replace(/datetime\('now'\)/gi, 'NOW()')
  .replace(/PRAGMA foreign_keys = ON;/gi, '')
  .replace(/PRAGMA journal_mode = WAL;/gi, '');

// Ensure users table in PG schema has oauth fields and nullable phone
pgSchema = pgSchema.replace(
  /CREATE TABLE IF NOT EXISTS users \([\s\S]*?\);/,
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'citizen',
    oauth_provider TEXT,
    oauth_id TEXT,
    avatar TEXT,
    state_id INTEGER REFERENCES states(id),
    is_active INTEGER NOT NULL DEFAULT 1,
    email_verified INTEGER NOT NULL DEFAULT 0,
    phone_verified INTEGER NOT NULL DEFAULT 0,
    preferred_language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
);

// Append missing runtime tables
pgSchema += `

-- ============================================================
-- 18. PAYMENT ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_orders (
  id SERIAL PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  user_id INTEGER REFERENCES users(id),
  state_id INTEGER,
  service_id INTEGER,
  government_fee NUMERIC NOT NULL,
  service_fee NUMERIC NOT NULL,
  gateway_fee NUMERIC NOT NULL,
  discount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'created',
  payment_method TEXT,
  gateway_reference TEXT,
  idempotency_key TEXT UNIQUE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_orders_app ON payment_orders(application_id);

-- ============================================================
-- 19. IN-APP CITIZEN NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  application_id INTEGER REFERENCES applications(id),
  type TEXT NOT NULL,
  title_key TEXT NOT NULL,
  body_key TEXT NOT NULL,
  params TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);

-- ============================================================
-- 20. OTP RELAY REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS otp_relay_requests (
  id SERIAL PRIMARY KEY,
  application_id INTEGER NOT NULL REFERENCES applications(id),
  citizen_user_id INTEGER NOT NULL REFERENCES users(id),
  requested_by INTEGER NOT NULL REFERENCES users(id),
  operator_public_key TEXT NOT NULL,
  ciphertext TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  fulfilled_at TIMESTAMPTZ,
  cleared_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_otp_relay_app ON otp_relay_requests(application_id, status);
`;

const supabaseSchemaPath = path.join(__dirname, '..', 'database', 'supabase_schema.sql');
fs.writeFileSync(supabaseSchemaPath, pgSchema);

// Convert seed to PG
let pgSeed = seed
  .replace(/datetime\('now'\)/gi, 'NOW()');

const supabaseSeedPath = path.join(__dirname, '..', 'database', 'supabase_seed.sql');
fs.writeFileSync(supabaseSeedPath, pgSeed);

console.log('Successfully generated:');
console.log('1.', supabaseSchemaPath);
console.log('2.', supabaseSeedPath);
