const { Pool } = require('pg');
const fs = require('fs');
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;");
    console.log('Tables in Supabase (' + res.rows.length + '):');
    console.log(res.rows.map(r => r.table_name).join(', '));

    const checkTable = async (t) => {
      try {
        const c = await pool.query(`SELECT count(*) FROM "${t}";`);
        console.log(`Table ${t}: ${c.rows[0].count} rows`);
      } catch (err) {
        console.log(`Table ${t}: error - ${err.message}`);
      }
    };

    await checkTable('states');
    await checkTable('services');
    await checkTable('users');
    await checkTable('privacy_policy_sections');
    await checkTable('privacy_notice_versions');
    await checkTable('payment_orders');
    await checkTable('notifications');
    await checkTable('otp_relay_requests');
    await checkTable('applications');
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await pool.end();
  }
}

main();
