const { Pool, types } = require('pg');
const crypto = require('crypto');
const fs = require('fs');

// Ensure BIGINT (type ID 20) is parsed as an integer rather than string
types.setTypeParser(20, (val) => (val === null ? null : parseInt(val, 10)));

// Load .env.local if present in dev
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
  });
}

const DEFAULT_PG_URL = process.env.DATABASE_URL || '';

let pool;

function getPgPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || DEFAULT_PG_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not configured.');
    }
    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

function translateSql(sql) {
  let s = sql;
  // SQLite to PostgreSQL dialect mappings
  s = s.replace(/datetime\('now'\)/gi, "to_char(NOW(), 'YYYY-MM-DD HH24:MI:SS')");
  s = s.replace(/date\('now'\)/gi, "CURRENT_DATE");
  s = s.replace(/SUBSTR\(([^,]+),\s*-(\d+)\)/gi, 'RIGHT($1, $2)');

  // Convert positional placeholders ? to $1, $2, ... outside string literals
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

function normalizeParams(args) {
  let list = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;
  return list.map(v => (v === undefined ? null : v));
}

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

  const isInsert = /^\s*INSERT\s/i.test(finalSql);
  const hasReturning = /RETURNING/i.test(finalSql);

  function resolveParams(args) {
    if (args.length === 1 && typeof args[0] === 'object' && !Array.isArray(args[0]) && args[0] !== null) {
      const obj = args[0];
      return namedParams.map(k => (obj[k] !== undefined ? obj[k] : null));
    }
    let list = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;
    return list.map(v => (v === undefined ? null : v));
  }

  return {
    async all(...params) {
      const p = resolveParams(params);
      const res = await executor.query(finalSql, p);
      return res.rows;
    },
    async get(...params) {
      const p = resolveParams(params);
      const res = await executor.query(finalSql, p);
      return res.rows[0] !== undefined ? res.rows[0] : undefined;
    },
    async run(...params) {
      const p = resolveParams(params);
      if (isInsert && !hasReturning) {
        try {
          const res = await executor.query(finalSql + ' RETURNING id', p);
          return {
            lastInsertRowid: res.rows[0]?.id || 0,
            changes: res.rowCount
          };
        } catch (err) {
          if (err.message && err.message.includes('does not exist')) {
            const res = await executor.query(finalSql, p);
            return { lastInsertRowid: 0, changes: res.rowCount };
          }
          throw err;
        }
      }
      const res = await executor.query(finalSql, p);
      return {
        lastInsertRowid: res.rows[0]?.id || 0,
        changes: res.rowCount
      };
    }
  };
}

function createDbWrapper(executor) {
  return {
    pool: executor,
    prepare(sql) {
      return createStatement(sql, executor);
    },
    async query(sql, params = []) {
      const translatedSql = translateSql(sql);
      return executor.query(translatedSql, normalizeParams(params));
    },
    async exec(sql) {
      return executor.query(sql);
    },
    transaction(callback) {
      return async (...args) => {
        const client = await (executor.connect ? executor.connect() : executor);
        const shouldRelease = !!executor.connect;
        try {
          await client.query('BEGIN');
          const clientDb = createDbWrapper(client);
          const result = await callback(clientDb, ...args);
          await client.query('COMMIT');
          return result;
        } catch (err) {
          await client.query('ROLLBACK');
          throw err;
        } finally {
          if (shouldRelease) client.release();
        }
      };
    }
  };
}

let dbInstance = null;

function getDb() {
  if (!dbInstance) {
    dbInstance = createDbWrapper(getPgPool());
  }
  return dbInstance;
}

function generateApplicationNumber(stateCode, serviceId) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = String(crypto.randomInt(0, 100000)).padStart(5, '0');
  return `DLF-${stateCode}-${year}${month}-${random}`;
}

module.exports = {
  getDb,
  getPgPool,
  generateApplicationNumber
};
