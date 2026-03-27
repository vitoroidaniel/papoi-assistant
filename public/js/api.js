/* ═══════════════════════════════════════════════════════════════
   PAOPOI — api.js
   Centralised fetch wrapper for all backend endpoints
═══════════════════════════════════════════════════════════════ */

const API = {
  async _req(method, url, body, isFormData = false) {
    const opts = { method, headers: {} };
    if (body) {
      if (isFormData) {
        opts.body = body;
      } else {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }
    const res = await fetch(url, opts);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  },

  get:    (url)        => API._req('GET',    url),
  post:   (url, body)  => API._req('POST',   url, body),
  put:    (url, body)  => API._req('PUT',    url, body),
  delete: (url)        => API._req('DELETE', url),
  form:   (url, form)  => API._req('POST',   url, form, true),

  // ── Chat ──────────────────────────────────────────────────────
  chat: {
    send: (messages) => API.post('/api/chat', { messages })
  },

  // ── Notes ─────────────────────────────────────────────────────
  notes: {
    list:   ()         => API.get('/api/notes'),
    create: (data)     => API.post('/api/notes', data),
    update: (id, data) => API.put(`/api/notes/${id}`, data),
    delete: (id)       => API.delete(`/api/notes/${id}`)
  },

  // ── Templates ─────────────────────────────────────────────────
  templates: {
    list:   ()     => API.get('/api/templates'),
    create: (data) => API.post('/api/templates', data),
    delete: (id)   => API.delete(`/api/templates/${id}`)
  },

  // ── Files ─────────────────────────────────────────────────────
  files: {
    list:     ()        => API.get('/api/files'),
    upload:   (form)    => API.form('/api/files/upload', form),
    download: (filename) => `/api/files/download/${filename}`,
    delete:   (id)      => API.delete(`/api/files/${id}`)
  },

  // ── Compress ──────────────────────────────────────────────────
  compress: {
    compress: (form) => API.form('/api/compress', form)
  },

  // ── PDFs ──────────────────────────────────────────────────────
  pdfs: {
    list:     ()           => API.get('/api/pdfs'),
    upload:   (form)       => API.form('/api/pdfs/upload', form),
    rename:   (id, newName) => API.put(`/api/pdfs/${id}/rename`, { newName }),
    download: (filename)   => `/api/pdfs/download/${filename}`,
    delete:   (id)         => API.delete(`/api/pdfs/${id}`)
  },

  // ── Clips ─────────────────────────────────────────────────────
  clips: {
    list:   ()     => API.get('/api/clips'),
    create: (data) => API.post('/api/clips', data),
    delete: (id)   => API.delete(`/api/clips/${id}`)
  },

  // ── Settings ──────────────────────────────────────────────────
  settings: {
    get:  ()     => API.get('/api/settings'),
    save: (data) => API.post('/api/settings', data)
  }
};
