const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');

const DB = 'notes/templates';

router.get('/', async (req, res) => {
  res.json(await readDB(DB));
});

router.post('/', async (req, res) => {
  const templates = await readDB(DB);
  const tmpl = {
    id: uuidv4(),
    name: req.body.name || 'Untitled Template',
    content: req.body.content || '',
    category: req.body.category || 'General',
    createdAt: new Date().toISOString()
  };
  templates.unshift(tmpl);
  await writeDB(DB, templates);
  res.json(tmpl);
});

router.delete('/:id', async (req, res) => {
  let templates = await readDB(DB);
  templates = templates.filter(t => t.id !== req.params.id);
  await writeDB(DB, templates);
  res.json({ ok: true });
});

module.exports = router;
