const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function main() {
  const sql = `
    CREATE OR REPLACE FUNCTION datetime(ts text, modifier text DEFAULT NULL) RETURNS timestamp AS $$
    BEGIN
      IF modifier IS NULL THEN
        IF ts = 'now' THEN
          RETURN NOW();
        ELSE
          RETURN ts::timestamp;
        END IF;
      ELSE
        -- modifier like '+30 days'
        RETURN (ts::timestamp + modifier::interval);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN NOW();
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;

    CREATE OR REPLACE FUNCTION datetime(ts timestamp, modifier text DEFAULT NULL) RETURNS timestamp AS $$
    BEGIN
      IF modifier IS NULL THEN
        RETURN ts;
      ELSE
        RETURN (ts + modifier::interval);
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RETURN NOW();
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `;

  await pool.query(sql);
  console.log('Created datetime compatibility functions in Supabase PostgreSQL!');

  const test1 = await pool.query("SELECT datetime('now');");
  console.log('datetime(now):', test1.rows[0]);

  const test2 = await pool.query("SELECT datetime('2026-09-01', '+30 days') as future;");
  console.log('datetime(2026-09-01, +30 days):', test2.rows[0]);

  await pool.end();
}
main();
