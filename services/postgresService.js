const { Pool } = require('pg');

let dbConfig = null;
let pool = null;

async function testConnection(config) {
  const testPool = new Pool(config);
  try {
    const client = await testPool.connect();
    await client.query('SELECT 1');
    client.release();
    await testPool.end();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function setConfig(config) {
  dbConfig = config;
  if (pool) pool.end();
  pool = new Pool(config);
}

function getConfig() {
  return dbConfig;
}

// Returns an object: { schemaText, tables: { tableName: [{column, data_type}] }, fks: [{table, column, foreign_table, foreign_column}] }
async function getSchemaMetadata() {
  if (!pool) return null;
  const client = await pool.connect();
  try {
    const tablesRes = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name");
    const tables = {};
    let schemaText = '';

    for (const row of tablesRes.rows) {
      const table = row.table_name;
      const colsRes = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 ORDER BY ordinal_position`, [table]);
      tables[table] = colsRes.rows.map(r => ({ column: r.column_name, data_type: r.data_type }));
      schemaText += `Table: ${table}\n  Columns: ${tables[table].map(c=>`${c.column} (${c.data_type})`).join(', ')}\n`;
    }

    // Foreign keys
    const fkQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `;
    const fkRes = await client.query(fkQuery);
    const fks = fkRes.rows.map(r => ({ table: r.table_name, column: r.column_name, foreign_table: r.foreign_table_name, foreign_column: r.foreign_column_name }));
    if (fks.length > 0) {
      schemaText += 'Foreign Keys:\n';
      schemaText += fks.map(f => `${f.table}.${f.column} -> ${f.foreign_table}(${f.foreign_column})`).join('\n') + '\n';
    }

    return { schemaText, tables, fks };
  } finally {
    client.release();
  }
}

module.exports = { testConnection, setConfig, getConfig, getSchemaMetadata };
