const path = require('path');
const fs = require('fs-extra');

const DATA_DIR = path.join(__dirname, '..', 'data');

function dbPath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

async function readDB(name, fallback = []) {
  try {
    return await fs.readJSON(dbPath(name));
  } catch {
    return fallback;
  }
}

async function writeDB(name, data) {
  await fs.writeJSON(dbPath(name), data, { spaces: 2 });
}

module.exports = { readDB, writeDB, DATA_DIR };
