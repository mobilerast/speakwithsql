// Build a simple graph from fk list
function buildGraph(fks) {
  const g = new Map();
  fks.forEach(f => {
    if (!g.has(f.table)) g.set(f.table, []);
    if (!g.has(f.foreign_table)) g.set(f.foreign_table, []);
    g.get(f.table).push({ table: f.foreign_table, fromCol: f.column, toCol: f.foreign_column });
    g.get(f.foreign_table).push({ table: f.table, fromCol: f.foreign_column, toCol: f.column });
  });
  return g;
}

// BFS to find path between tables
function findPath(graph, start, goal) {
  if (start === goal) return [];
  const q = [[start]];
  const seen = new Set([start]);
  while (q.length) {
    const path = q.shift();
    const node = path[path.length - 1];
    const neighbors = graph.get(node) || [];
    for (const nb of neighbors) {
      if (seen.has(nb.table)) continue;
      const newPath = path.concat([nb.table]);
      if (nb.table === goal) return newPath;
      q.push(newPath);
      seen.add(nb.table);
    }
  }
  return null;
}

// Very small helper: convert "col = 'val'" to LOWER(col) = LOWER($n) and return params
function normalizeCaseEquality(sql, schemaTables) {
  const params = [];
  // naive regex - for production use a SQL parser
  const regex = /([a-zA-Z0-9_\.]+)\s*=\s*'([^']*)'/g;
  let idx = 1;
  const newSql = sql.replace(regex, (m, col, val) => {
    // determine column type if possible
    const parts = col.split('.');
    let table = null; let column = parts.pop();
    if (parts.length > 0) table = parts.join('.');
    let isText = true;
    if (table && schemaTables && schemaTables[table]) {
      const colMeta = schemaTables[table].find(c => c.column === column);
      if (colMeta && !colMeta.data_type.includes('char') && !colMeta.data_type.includes('text')) {
        isText = false;
      }
    }
    if (isText) {
      params.push(val);
      return `LOWER(${col}) = LOWER($${idx++})`;
    }
    // non-text -> keep as-is
    params.push(val);
    return `${col} = $${idx++}`;
  });
  return { sql: newSql, params };
}

// Attach joins between tables that appear in FROM/WHERE but without joins
function addJoinsIfMissing(sql, schema) {
  // Very naive approach: find table names mentioned
  const tablesInSchema = Object.keys(schema.tables || {});
  const mentioned = new Set();
  for (const t of tablesInSchema) {
    const regex = new RegExp(`\\b${t}\\b`, 'i');
    if (regex.test(sql)) mentioned.add(t);
  }
  const tables = Array.from(mentioned);
  if (tables.length <= 1) return { sql, joinsAdded: [] };

  // Build graph and try to connect them via paths
  const graph = buildGraph(schema.fks || []);
  const joins = [];
  // start from first table
  const base = tables[0];
  for (let i = 1; i < tables.length; i++) {
    const target = tables[i];
    const path = findPath(graph, base, target);
    if (!path) continue;
    // construct JOINs along the path
    for (let j = 0; j < path.length - 1; j++) {
      const a = path[j];
      const b = path[j+1];
      // find fk connecting a and b
      const fk = (schema.fks || []).find(f => (f.table === a && f.foreign_table === b) || (f.table === b && f.foreign_table === a));
      if (!fk) continue;
      // determine join condition
      let cond;
      if (fk.table === a) cond = `${a}.${fk.column} = ${b}.${fk.foreign_column}`;
      else cond = `${b}.${fk.column} = ${a}.${fk.foreign_column}`;
      joins.push({ left: a, right: b, condition: cond });
    }
  }

  if (joins.length === 0) return { sql, joinsAdded: [] };

  // Insert joins after FROM <base>
  const fromRegex = new RegExp(`(FROM\\s+${base})([\s\S]*?)(WHERE|$)`, 'i');
  const match = sql.match(fromRegex);
  if (!match) return { sql, joinsAdded: joins };
  let insertPos = match.index + match[1].length;
  let joinSql = '';
  for (const j of joins) {
    // avoid duplicate join
    if (new RegExp(`JOIN\\s+${j.right}\\s+ON\\s+${escapeRegExp(j.condition)}`, 'i').test(sql)) continue;
    joinSql += ` JOIN ${j.right} ON ${j.condition}`;
  }
  const newSql = sql.replace(fromRegex, (m, p1, p2, p3) => `${p1}${p2}${joinSql}${p3 ? p3 : ''}`);
  return { sql: newSql, joinsAdded: joins };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { normalizeCaseEquality, addJoinsIfMissing };
