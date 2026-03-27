const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');

const DB = 'notes/notes';

router.get('/', async (req, res) => {
  res.json(await readDB(DB));
});

router.post('/', async (req, res) => {
  const notes = await readDB(DB);
  const note = {
    id: uuidv4(),
    title: req.body.title || 'Untitled',
    content: req.body.content || '',
    color: req.body.color || '#ffffff',
    tags: req.body.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  notes.unshift(note);
  await writeDB(DB, notes);
  res.json(note);
});

router.put('/:id', async (req, res) => {
  const notes = await readDB(DB);
  const idx = notes.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  notes[idx] = { ...notes[idx], ...req.body, updatedAt: new Date().toISOString() };
  await writeDB(DB, notes);
  res.json(notes[idx]);
});

router.delete('/:id', async (req, res) => {
  let notes = await readDB(DB);
  notes = notes.filter(n => n.id !== req.params.id);
  await writeDB(DB, notes);
  res.json({ ok: true });
});

module.exports = router;
