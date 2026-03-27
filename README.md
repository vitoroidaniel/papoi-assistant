# 🍌 Paopoi

Your personal AI workspace. Bello!

## Features

| Tab | What it does |
|-----|-------------|
| 🤖 AI Chat | Chat with Grok AI, full message history per session |
| 📝 Notes | Create, edit, color-code notes + reusable templates |
| 📁 Files | Upload & manage .txt .md .csv .json .xml files |
| 🖼️ Compress | Compress images (JPEG/WebP/PNG), quality slider, batch |
| 📄 PDF Renamer | Upload PDFs, rename individually or with bulk patterns |
| 📋 Snippets | Save frequently-used text snippets, click to copy |

---

## 🚀 Deploy to Railway

### Option A — Docker (recommended)

1. Push this repo to GitHub
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**
3. Railway auto-detects the `Dockerfile`
4. In **Variables**, add:
   ```
   GROK_API_KEY=xai-your-key-here
   PORT=3000
   ```
5. Click **Deploy** — your site will be live in ~2 minutes

### Option B — ZIP upload

1. Zip the entire project folder
2. In Railway → New Project → **Deploy from local** → drag the zip
3. Add environment variables as above

---

## 🔑 Getting a Grok API Key

1. Go to [console.x.ai](https://console.x.ai)
2. Sign in with your X (Twitter) account
3. Create an API key
4. Add it in **⚙️ Settings** inside Paopoi (or set `GROK_API_KEY` env var on Railway)

---

## 🛠 Local Development

```bash
# Install deps
npm install

# Copy env
cp .env.example .env
# Edit .env and add your GROK_API_KEY

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
paopoi/
├── Dockerfile
├── railway.toml
├── package.json
├── .env.example
├── src/
│   ├── server.js          # Express app entry
│   ├── db.js              # JSON file DB helper
│   └── routes/
│       ├── chat.js        # Grok AI proxy
│       ├── notes.js       # Notes CRUD
│       ├── templates.js   # Templates CRUD
│       ├── files.js       # File uploads
│       ├── compress.js    # Image compression (sharp)
│       ├── pdfs.js        # PDF upload & rename
│       ├── clips.js       # Clipboard snippets
│       └── settings.js    # API key & prefs
├── public/
│   ├── index.html
│   ├── css/
│   │   ├── main.css       # Variables, layout, welcome
│   │   ├── components.css # Cards, buttons, inputs
│   │   └── tabs.css       # Per-tab styles
│   └── js/
│       ├── api.js         # Fetch wrapper
│       ├── utils.js       # Toast, modal, helpers
│       ├── app.js         # Tab routing + init
│       ├── chat.js
│       ├── notes.js
│       ├── files.js
│       ├── compress.js
│       ├── pdfs.js
│       ├── clips.js
│       └── settings.js
└── data/                  # Auto-created, persisted JSON + uploads
    ├── uploads/
    ├── notes/
    ├── pdfs/
    └── clips/
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+1`  | AI Chat |
| `Alt+2`  | Notes |
| `Alt+3`  | Files |
| `Alt+4`  | Image Compressor |
| `Alt+5`  | PDF Renamer |
| `Alt+6`  | Snippets |
| `Alt+0`  | Settings |
| `Ctrl+S` | Save note (inside editor) |
| `Enter`  | Send chat message |
| `Shift+Enter` | New line in chat |

---

> Made with 🍌 and love. Bello!
