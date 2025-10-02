const mysql = require('mysql2/promise');

let dbConfig = null;

async function testConnection(config) {
  try {
    const connection = await mysql.createConnection(config);
    await connection.ping();
    await connection.end();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function setConfig(config) {
  dbConfig = config;
}

function getConfig() {
  return dbConfig;
}

async function getSchemaMetadata() {
  if (!dbConfig) return null;
  const connection = await mysql.createConnection(dbConfig);
  const [tables] = await connection.query("SHOW TABLES");
  let schema = '';
  for (const row of tables) {
    const tableName = Object.values(row)[0];
    schema += `Table: ${tableName}\n`;
    const [columns] = await connection.query(`SHOW COLUMNS FROM \\\`${tableName}\\\``);
    schema += '  Columns: ' + columns.map(col => `${col.Field} (${col.Type})`).join(', ') + '\n';
    // Foreign keys
    const [fks] = await connection.query(`SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`, [dbConfig.database, tableName]);
    if (fks.length > 0) {
      schema += '  Foreign Keys: ' + fks.map(fk => `${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}(${fk.REFERENCED_COLUMN_NAME})`).join(', ') + '\n';
    }
  }
  await connection.end();
  return schema;
}

module.exports = { testConnection, setConfig, getConfig, getSchemaMetadata };
