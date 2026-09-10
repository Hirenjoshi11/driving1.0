const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const sql = "INSERT INTO notifications (user_id, type, title_key, body_key) VALUES ($1, $2, $3, $4) RETURNING id;";
  const res = await pool.query(sql, [1, 'test', 'title.test', 'body.test']);
  console.log('Inserted id:', res.rows[0].id);
  // clean up
  await pool.query("DELETE FROM notifications WHERE id = $1;", [res.rows[0].id]);
  await pool.end();
}
main();
