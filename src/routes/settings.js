const router = require('express').Router();
const { readDB, writeDB } = require('../db');

const DB = 'notes/settings';

router.get('/', async (req, res) => {
  const s = await readDB(DB, {});
  // Never expose the key to frontend - just tell if it's set
  const safe = { ...s };
  if (safe.grokApiKey) {
    safe.grokApiKeySet = true;
    safe.grokApiKey = ''; // don't send back
  }
  res.json(safe);
});

router.post('/', async (req, res) => {
  const existing = await readDB(DB, {});
  const incoming = { ...req.body };

  // If key is empty string (not changed), preserve existing
  if (!incoming.grokApiKey && existing.grokApiKey) {
    incoming.grokApiKey = existing.grokApiKey;
  }

  const merged = { ...existing, ...incoming };
  await writeDB(DB, merged);

  // Apply to runtime env
  if (merged.grokApiKey) process.env.GROK_API_KEY = merged.grokApiKey;

  res.json({ ok: true });
});

module.exports = router;
