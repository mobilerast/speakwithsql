require('dotenv').config();
const axios = require('axios');
const pgService = require('./postgresService');
const postProcessor = require('./sqlPostProcessor');

// A small schema hint if no DB connection is configured (keeps previous metadata)
const dbMetadata = `
Tables and columns:
- universities(id, name)
- users(id, full_name, orcid, google_scholar, university_id)
- expertise_areas(id, name)
- user_expertise(user_id, expertise_id)
- publication_types(id, type_name)
- publications(id, title, journal, year, doi, type_id)
- publication_authors(publication_id, user_id, author_order)
- publication_citations(id, publication_id, citation_count, year)
`;

const fewShotExamples = `
Example 1:
User question: List all users.
SQL:
SELECT * FROM users;

Example 2:
User question: Show all publications from 2024.
SQL:
SELECT * FROM publications WHERE year = 2024;

Example 3:
User question: List the names of users and their universities.
SQL:
SELECT u.full_name, un.name FROM users u JOIN universities un ON u.university_id = un.id;
`;

async function getSQLFromOpenAI(userQuestion, dialect = 'postgres') {
  const prompt = `Given the following database schema (if available we'll use live schema):\n${dbMetadata}\n\nTarget SQL dialect: ${dialect}\n\n${fewShotExamples}\nUser question: ${userQuestion}\n\nWrite a single SQL query (no explanation, just SQL):`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes SQL queries for the given database schema and dialect.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 512,
        temperature: 0.2
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    // Extract SQL from OpenAI response
    let sql = response.data.choices[0].message.content.trim();

    // Try to fetch live schema metadata from Postgres if configured
    let schema = null;
    try {
      const md = await pgService.getSchemaMetadata();
      if (md) schema = md; // { schemaText, tables, fks }
    } catch (err) {
      // ignore; we'll fallback to dbMetadata hint
      console.warn('Could not fetch Postgres metadata:', err.message || err);
    }

    // Normalize case-equality and parameterize
    const norm = postProcessor.normalizeCaseEquality(sql, schema ? schema.tables : null);
    sql = norm.sql;
    const params = norm.params || [];

    // Try to add JOINs if missing and we have schema fk info
    let joinsAdded = [];
    if (schema) {
      const added = postProcessor.addJoinsIfMissing(sql, schema);
      sql = added.sql;
      joinsAdded = added.joinsAdded || [];
    }

    return { sql, params, joinsAdded };
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return { sql: '-- Error: Could not generate SQL.', params: [] };
  }
}

module.exports = { getSQLFromOpenAI };
