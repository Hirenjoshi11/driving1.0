const { Pool } = require('pg');

function createPostgresDb(connectionString) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  function translateSql(sql) {
    let s = sql;
    s = s.replace(/datetime\('now'\)/gi, "to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')");
    s = s.replace(/date\('now'\)/gi, "CURRENT_DATE");
    s = s.replace(/SUBSTR\(([^,]+),\s*-(\d+)\)/gi, 'RIGHT($1, $2)');

    let paramIndex = 1;
    let inString = false;
    let result = '';
    for (let i = 0; i < s.length; i++) {
      const ch = s[i];
      if (ch === "'") {
        inString = !inString;
        result += ch;
      } else if (ch === '?' && !inString) {
        result += `$${paramIndex++}`;
      } else {
        result += ch;
      }
    }
    return result;
  }

  function createStatement(sql, executor) {
    const translatedSql = translateSql(sql);
    const isInsert = /^\s*INSERT\s/i.test(translatedSql);
    const hasReturning = /RETURNING/i.test(translatedSql);

    function normalizeParams(args) {
      if (args.length === 1 && Array.isArray(args[0])) {
        return args[0];
      }
      return args;
    }

    return {
      async all(...params) {
        const p = normalizeParams(params);
        const res = await executor.query(translatedSql, p);
        return res.rows;
      },
      async get(...params) {
        const p = normalizeParams(params);
        const res = await executor.query(translatedSql, p);
        return res.rows[0] || null;
      },
      async run(...params) {
        const p = normalizeParams(params);
        if (isInsert && !hasReturning) {
          try {
            const res = await executor.query(translatedSql + ' RETURNING id', p);
            return {
              lastInsertRowid: res.rows[0]?.id || 0,
              changes: res.rowCount
            };
          } catch (err) {
            if (err.message && err.message.includes('does not exist')) {
              const res = await executor.query(translatedSql, p);
              return { lastInsertRowid: 0, changes: res.rowCount };
            }
            throw err;
          }
        }
        const res = await executor.query(translatedSql, p);
        return {
          lastInsertRowid: res.rows[0]?.id || 0,
          changes: res.rowCount
        };
      }
    };
  }

  const db = {
    pool,
    prepare(sql) {
      return createStatement(sql, pool);
    },
    async query(sql, params = []) {
      const translatedSql = translateSql(sql);
      return pool.query(translatedSql, params);
    },
    async exec(sql) {
      return pool.query(sql);
    }
  };

  return db;
}

async function test() {
  const db = createPostgresDb('postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres');
  try {
    const states = await db.prepare('SELECT id, name, slug FROM states WHERE is_active = ? ORDER BY sort_order').all(1);
    console.log('States:', states);

    const singleState = await db.prepare('SELECT * FROM states WHERE slug = ?').get('gujarat');
    console.log('Single state:', singleState ? singleState.name : null);

    const testInsert = await db.prepare('INSERT INTO notifications (user_id, type, title_key, body_key) VALUES (?, ?, ?, ?)').run(1, 'test', 'test.title', 'test.body');
    console.log('Insert result:', testInsert);

    const deleted = await db.prepare('DELETE FROM notifications WHERE id = ?').run(testInsert.lastInsertRowid);
    console.log('Delete result:', deleted);
  } finally {
    await db.pool.end();
  }
}

test();
