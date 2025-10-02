const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const chatRoutes = require('./routes/chatRoutes');
const path = require('path');
const { testConnection, setConfig, getSchemaMetadata } = require('./services/mysqlService');

const app = express();

app.use(cors());
app.use(bodyParser.json());

// MySQL config: set/test
app.post('/api/mysql/config', async (req, res) => {
  const config = req.body;
  const result = await testConnection(config);
  if (result.success) {
    setConfig(config);
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, error: result.error });
  }
});

// Get MySQL schema metadata
app.get('/api/mysql/schema', async (req, res) => {
  try {
    const schema = await getSchemaMetadata();
    if (!schema) return res.status(400).json({ error: 'Not connected' });
    res.json({ schema });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', chatRoutes);
app.use(express.static(path.join(__dirname, 'public')));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
