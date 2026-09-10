const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  await pool.query('ALTER TABLE driving_test_centres ADD COLUMN IF NOT EXISTS phone TEXT;');
  console.log('Added phone column to driving_test_centres in Supabase!');
  await pool.end();
}
main();
