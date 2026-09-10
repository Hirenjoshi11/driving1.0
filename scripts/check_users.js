const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const res = await pool.query(`SELECT id, name, email, phone, role FROM users;`);
  console.log('Users in Supabase:', res.rows);
  await pool.end();
}
main();
