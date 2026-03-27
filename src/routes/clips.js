const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');

const DB = 'clips/clips';

router.get('/', async (req, res) => {
  res.json(await readDB(DB));
});

router.post('/', async (req, res) => {
  const clips = await readDB(DB);
  const clip = {
    id: uuidv4(),
    label: req.body.label || '',
    text: req.body.text || '',
    color: req.body.color || 'blue',
    createdAt: new Date().toISOString()
  };
  clips.unshift(clip);
  if (clips.length > 200) clips.splice(200);
  await writeDB(DB, clips);
  res.json(clip);
});

router.delete('/:id', async (req, res) => {
  let clips = await readDB(DB);
  clips = clips.filter(c => c.id !== req.params.id);
  await writeDB(DB, clips);
  res.json({ ok: true });
});

module.exports = router;
