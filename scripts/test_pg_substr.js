const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query("SELECT SUBSTR('12345678', -4) as sub;").catch(e => e.message);
    console.log('SUBSTR result:', res.rows ? res.rows[0] : res);

    const res2 = await pool.query("SELECT RIGHT('12345678', 4) as r;").catch(e => e.message);
    console.log('RIGHT result:', res2.rows ? res2.rows[0] : res2);
  } finally {
    await pool.end();
  }
}
main();
