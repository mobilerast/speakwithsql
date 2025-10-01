require('dotenv').config();
const axios = require('axios');

// Extracted metadata from dummy_data.sql
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

async function getSQLFromOpenAI(userQuestion) {
  const prompt = `Given the following database schema:\n${dbMetadata}\n\nUser question: ${userQuestion}\n\nWrite a single SQL query (no explanation, just SQL):`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes SQL queries for the given database schema.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 256,
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
    const sql = response.data.choices[0].message.content.trim();
    return sql;
  } catch (error) {
    console.error('OpenAI API error:', error.response?.data || error.message);
    return '-- Error: Could not generate SQL.';
  }
}

module.exports = { getSQLFromOpenAI };
