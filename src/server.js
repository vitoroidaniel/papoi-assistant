require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directories exist
const dataDirs = ['data/uploads', 'data/notes', 'data/pdfs', 'data/clips'];
dataDirs.forEach(d => fs.ensureDirSync(path.join(__dirname, '..', d)));

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Routes
app.use('/api/chat',      require('./routes/chat'));
app.use('/api/notes',     require('./routes/notes'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/files',     require('./routes/files'));
app.use('/api/compress',  require('./routes/compress'));
app.use('/api/pdfs',      require('./routes/pdfs'));
app.use('/api/clips',     require('./routes/clips'));
app.use('/api/settings',  require('./routes/settings'));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🍌 Paopoi running on http://localhost:${PORT}`);
});
