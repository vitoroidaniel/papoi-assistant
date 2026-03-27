const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DATA_DIR } = require('../db');
const fs = require('fs-extra');

const DB = 'uploads/meta';
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}_${file.originalname}`)
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.txt', '.md', '.csv', '.json', '.xml', '.log', '.yaml', '.yml'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type ${ext} not allowed. Use: ${allowed.join(', ')}`));
  }
});

router.get('/', async (req, res) => {
  res.json(await readDB(DB));
});

router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const meta = await readDB(DB);
  const entry = {
    id: uuidv4(),
    originalName: req.file.originalname,
    filename: req.file.filename,
    size: req.file.size,
    uploadedAt: new Date().toISOString()
  };
  meta.unshift(entry);
  await writeDB(DB, meta);
  res.json(entry);
});

router.get('/download/:filename', (req, res) => {
  const filePath = path.join(UPLOAD_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  res.download(filePath);
});

router.delete('/:id', async (req, res) => {
  let meta = await readDB(DB);
  const entry = meta.find(f => f.id === req.params.id);
  if (entry) {
    const fp = path.join(UPLOAD_DIR, entry.filename);
    if (fs.existsSync(fp)) fs.removeSync(fp);
  }
  meta = meta.filter(f => f.id !== req.params.id);
  await writeDB(DB, meta);
  res.json({ ok: true });
});

module.exports = router;
