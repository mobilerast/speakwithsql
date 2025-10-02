const { getSQLFromOpenAI } = require('../services/openaiService');

exports.handleChat = async (req, res) => {
  const { message, dialect } = req.body;
  console.log('Received message:', message, 'Dialect:', dialect);
  try {
    const sql = await getSQLFromOpenAI(message, dialect);
    res.json({ reply: sql });
  } catch (err) {
    res.status(500).json({ reply: '-- Error: Could not generate SQL.' });
  }
};
