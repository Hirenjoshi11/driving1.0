const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const sql = "SELECT to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS') as dt;";
  const res = await pool.query(sql);
  console.log('Result:', res.rows[0]);
  await pool.end();
}
main();
