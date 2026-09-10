const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:YOUR_PASSWORD@db.vrblrjfnbkguylobasdj.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

function createStatement(sql, executor) {
  let s = sql;
  s = s.replace(/datetime\('now'\)/gi, "to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')");
  s = s.replace(/date\('now'\)/gi, "CURRENT_DATE");
  s = s.replace(/SUBSTR\(([^,]+),\s*-(\d+)\)/gi, 'RIGHT($1, $2)');

  const namedParamRegex = /[@:]([a-zA-Z0-9_]+)/g;
  const namedParams = [];
  let match;
  while ((match = namedParamRegex.exec(s)) !== null) {
    namedParams.push(match[1]);
  }

  let finalSql = s;
  if (namedParams.length > 0) {
    let index = 1;
    finalSql = s.replace(/[@:]([a-zA-Z0-9_]+)/g, () => `$${index++}`);
  } else {
    let index = 1;
    let inString = false;
    let res = '';
    for (let i = 0; i < s.length; i++) {
      if (s[i] === "'") {
        inString = !inString;
        res += s[i];
      } else if (s[i] === '?' && !inString) {
        res += `$${index++}`;
      } else {
        res += s[i];
      }
    }
    finalSql = res;
  }

  function resolveParams(args) {
    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) && args[0] !== null) {
      const obj = args[0];
      return namedParams.map(k => (obj[k] !== undefined ? obj[k] : null));
    }
    let list = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;
    return list.map(v => (v === undefined ? null : v));
  }

  return {
    async run(...args) {
      const p = resolveParams(args);
      let querySql = finalSql;
      if (/^\s*INSERT\s/i.test(finalSql) && !/RETURNING/i.test(finalSql)) {
        querySql += ' RETURNING id';
      }
      const res = await executor.query(querySql, p);
      return { lastInsertRowid: res.rows[0]?.id || 0, changes: res.rowCount };
    },
    async get(...args) {
      const p = resolveParams(args);
      const res = await executor.query(finalSql, p);
      return res.rows[0] !== undefined ? res.rows[0] : undefined;
    }
  };
}

async function test() {
  try {
    const stmt = createStatement(`
      INSERT INTO notifications (user_id, type, title_key, body_key)
      VALUES (@user_id, @type, @title_key, @body_key)
    `, pool);

    const info = await stmt.run({
      user_id: 1,
      type: 'named_test',
      title_key: 'test_title',
      body_key: 'test_body'
    });
    console.log('Inserted with named params, id:', info.lastInsertRowid);

    const selectStmt = createStatement(`SELECT * FROM notifications WHERE id = @id`, pool);
    const row = await selectStmt.get({ id: info.lastInsertRowid });
    console.log('Retrieved row:', row ? row.type : null);

    // cleanup
    await pool.query('DELETE FROM notifications WHERE id = $1', [info.lastInsertRowid]);
    console.log('Cleaned up!');
  } finally {
    await pool.end();
  }
}

test();
