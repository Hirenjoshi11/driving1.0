const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const r = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'privacy_policy_sections';");
    console.log('Columns in privacy_policy_sections:');
    r.rows.forEach(col => console.log(col.column_name, col.data_type));
  } finally {
    await pool.end();
  }
}
main();
