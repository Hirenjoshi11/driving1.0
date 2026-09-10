const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const tables = [
    'states', 'licence_services', 'districts', 'rto_offices',
    'fee_structure', 'service_steps', 'vehicle_classes',
    'service_vehicle_classes', 'document_types', 'service_documents',
    'privacy_policy_sections', 'privacy_notice_versions',
    'processing_purposes', 'data_inventory', 'users'
  ];

  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT count(*) FROM "${t}";`);
      console.log(`${t}: ${res.rows[0].count}`);
    } catch (e) {
      console.log(`${t}: ERROR ${e.message}`);
    }
  }
  await pool.end();
}
main();
