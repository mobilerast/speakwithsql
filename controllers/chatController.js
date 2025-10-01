const { getSQLFromOpenAI } = require('../services/openaiService');

exports.handleChat = async (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);
  try {
    const sql = await getSQLFromOpenAI(message);
    res.json({ reply: sql });
  } catch (err) {
    res.status(500).json({ reply: '-- Error: Could not generate SQL.' });
  }
};
