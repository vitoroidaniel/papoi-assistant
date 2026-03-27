const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB, DATA_DIR } = require('../db');
const fs = require('fs-extra');

const DB = 'pdfs/meta';
const PDF_DIR = path.join(DATA_DIR, 'pdfs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PDF_DIR),
  filename: (req, file, cb) => cb(null, `${uuidv4()}.pdf`)
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (path.extname(file.originalname).toLowerCase() === '.pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'));
  }
});

router.get('/', async (req, res) => {
  res.json(await readDB(DB));
});

router.post('/upload', upload.array('pdfs', 50), async (req, res) => {
  const meta = await readDB(DB);
  const entries = req.files.map(f => {
    const baseName = path.basename(f.originalname, '.pdf');
    return {
      id: uuidv4(),
      originalName: f.originalname,
      newName: baseName,
      filename: f.filename,
      size: f.size,
      uploadedAt: new Date().toISOString()
    };
  });
  meta.unshift(...entries);
  await writeDB(DB, meta);
  res.json(entries);
});

router.put('/:id/rename', async (req, res) => {
  const meta = await readDB(DB);
  const idx = meta.findIndex(f => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  meta[idx].newName = req.body.newName || meta[idx].newName;
  await writeDB(DB, meta);
  res.json(meta[idx]);
});

router.get('/download/:filename', async (req, res) => {
  const meta = await readDB(DB);
  const entry = meta.find(f => f.filename === req.params.filename);
  const filePath = path.join(PDF_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const downloadName = entry ? `${entry.newName}.pdf` : req.params.filename;
  res.download(filePath, downloadName);
});

router.delete('/:id', async (req, res) => {
  let meta = await readDB(DB);
  const entry = meta.find(f => f.id === req.params.id);
  if (entry) {
    const fp = path.join(PDF_DIR, entry.filename);
    if (fs.existsSync(fp)) fs.removeSync(fp);
  }
  meta = meta.filter(f => f.id !== req.params.id);
  await writeDB(DB, meta);
  res.json({ ok: true });
});

module.exports = router;
