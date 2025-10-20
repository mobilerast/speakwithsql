const mysql = require('mysql2/promise');

let dbConfig = null;
let pool = null;

async function testConnection(config) {
  try {
    const testPool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 5, queueLimit: 0 });
    const conn = await testPool.getConnection();
    await conn.ping();
    conn.release();
    await testPool.end();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function setConfig(config) {
  dbConfig = config;
  if (pool) pool.end();
  pool = mysql.createPool({ ...config, waitForConnections: true, connectionLimit: 10, queueLimit: 0 });
}

function getConfig() {
  return dbConfig;
}

async function getSchemaMetadata() {
  if (!pool) return null;
  const conn = await pool.getConnection();
  const [tables] = await conn.query("SHOW TABLES");
  let schema = '';
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    schema += `Table: ${tableName}\n`;
  const [columns] = await conn.query(`SHOW COLUMNS FROM ${tableName}`);
    schema += '  Columns: ' + columns.map(col => `${col.Field} (${col.Type})`).join(', ') + '\n';
    // Foreign keys
    const [fks] = await conn.query(`SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`, [dbConfig.database, tableName]);
    if (fks.length > 0) {
      schema += '  Foreign Keys: ' + fks.map(fk => `${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`).join(', ') + '\n';
    }
  }
  conn.release();
  return schema;
}

module.exports = { testConnection, setConfig, getConfig, getSchemaMetadata };
