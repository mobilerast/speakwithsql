const postProcessor = require('../services/sqlPostProcessor');

async function runTests() {
  const mockSchema = {
    tables: {
      users: [ { column: 'id', data_type: 'integer' }, { column: 'full_name', data_type: 'text' }, { column: 'university_id', data_type: 'integer' } ],
      universities: [ { column: 'id', data_type: 'integer' }, { column: 'name', data_type: 'text' } ],
      publications: [ { column: 'id', data_type: 'integer' }, { column: 'title', data_type: 'text' } ],
      publication_authors: [ { column: 'publication_id', data_type: 'integer' }, { column: 'user_id', data_type: 'integer' } ]
    },
    fks: [
      { table: 'users', column: 'university_id', foreign_table: 'universities', foreign_column: 'id' },
      { table: 'publication_authors', column: 'user_id', foreign_table: 'users', foreign_column: 'id' },
      { table: 'publication_authors', column: 'publication_id', foreign_table: 'publications', foreign_column: 'id' }
    ]
  };

  const examples = [
    {
      name: 'case-insensitive equality',
      sql: "SELECT * FROM users WHERE full_name = 'Hacettepe Üniversitesi'"
    },
    {
      name: 'join insertion simple',
      sql: "SELECT u.full_name, un.name FROM users u, universities un WHERE u.university_id = un.id AND un.name = 'Hacettepe Üniversitesi'"
    },
    {
      name: 'missing join (should add)',
      sql: "SELECT u.full_name, c.title FROM users u, publication_authors pa, publications c WHERE pa.user_id = u.id AND pa.publication_id = c.id"
    }
  ];

  for (const ex of examples) {
    console.log('---', ex.name, '---');
    const norm = postProcessor.normalizeCaseEquality(ex.sql, mockSchema.tables);
    console.log('Normalized SQL:', norm.sql);
    console.log('Params:', norm.params);
    const added = postProcessor.addJoinsIfMissing(norm.sql, mockSchema);
    console.log('With Joins:', added.sql);
    console.log('Joins Added:', added.joinsAdded);
    console.log('\n');
  }
}

runTests().catch(err => { console.error(err); process.exit(1); });
