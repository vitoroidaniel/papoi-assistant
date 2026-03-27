/* ═══════════════════════════════════════════════════════════════
   PAOPOI — notes.js
   Notes CRUD + Templates
═══════════════════════════════════════════════════════════════ */

const Notes = (() => {
  let notes      = [];
  let templates  = [];
  let activeNote = null;

  const NOTE_COLORS = ['#ffffff','#fef9c3','#dbeafe','#dcfce7','#fce7f3','#f3e8ff','#ffedd5'];

  // ── DOM refs ───────────────────────────────────────────────────
  const noteList     = document.getElementById('note-list');
  const searchInput  = document.getElementById('notes-search');
  const titleInput   = document.getElementById('note-title-input');
  const contentInput = document.getElementById('note-content-input');
  const noteForm     = document.getElementById('note-form');
  const placeholder  = document.getElementById('note-placeholder');
  const colorRow     = document.getElementById('note-colors');
  const saveBtn      = document.getElementById('note-save-btn');
  const deleteBtn    = document.getElementById('note-delete-btn');
  const newBtn       = document.getElementById('new-note-btn');
  const tmplList     = document.getElementById('template-list');
  const tmplName     = document.getElementById('tmpl-name');
  const tmplCat      = document.getElementById('tmpl-category');
  const tmplContent  = document.getElementById('tmpl-content');
  const tmplSaveBtn  = document.getElementById('tmpl-save-btn');

  let selectedColor = '#ffffff';

  // ── Color picker ───────────────────────────────────────────────
  function buildColorPicker() {
    colorRow.innerHTML = NOTE_COLORS.map(c =>
      `<div class="color-dot${c === selectedColor ? ' active' : ''}" data-color="${c}" style="background:${c};border-color:${c === '#ffffff' ? '#e2e8f0' : c}"></div>`
    ).join('');
    colorRow.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        selectedColor = dot.dataset.color;
        colorRow.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
        dot.classList.add('active');
      });
    });
  }

  // ── Render note list ───────────────────────────────────────────
  function renderList(filter = '') {
    const filtered = notes.filter(n =>
      n.title.toLowerCase().includes(filter) ||
      n.content.toLowerCase().includes(filter)
    );

    if (!filtered.length) {
      noteList.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>${filter ? 'No notes match your search.' : 'No notes yet. Create one!'}</p></div>`;
      return;
    }

    noteList.innerHTML = filtered.map(n => `
      <div class="note-item${activeNote?.id === n.id ? ' active' : ''}" data-id="${n.id}"
           style="background:${n.color === '#ffffff' ? '' : `${n.color}99`}">
        <div class="note-item-title">${escapeHtml(n.title)}</div>
        <div class="note-item-preview">${escapeHtml(n.content.replace(/\n/g, ' '))}</div>
        <div class="note-item-date">${formatDate(n.updatedAt)}</div>
      </div>
    `).join('');

    noteList.querySelectorAll('.note-item').forEach(el => {
      el.addEventListener('click', () => openNote(notes.find(n => n.id === el.dataset.id)));
    });
  }

  // ── Open note in editor ────────────────────────────────────────
  function openNote(note) {
    activeNote = note;
    selectedColor = note.color || '#ffffff';
    titleInput.value   = note.title;
    contentInput.value = note.content;
    placeholder.style.display = 'none';
    noteForm.style.display    = 'flex';
    buildColorPicker();
    renderList(searchInput.value.toLowerCase());
  }

  function newNote() {
    activeNote = null;
    selectedColor = '#ffffff';
    titleInput.value   = '';
    contentInput.value = '';
    placeholder.style.display = 'none';
    noteForm.style.display    = 'flex';
    buildColorPicker();
    titleInput.focus();
    renderList(searchInput.value.toLowerCase());
  }

  // ── Save ───────────────────────────────────────────────────────
  async function saveNote() {
    const title   = titleInput.value.trim() || 'Untitled';
    const content = contentInput.value;
    const color   = selectedColor;

    try {
      if (activeNote) {
        const updated = await API.notes.update(activeNote.id, { title, content, color });
        notes = notes.map(n => n.id === updated.id ? updated : n);
        activeNote = updated;
        toast('Note saved!', 'success');
      } else {
        const created = await API.notes.create({ title, content, color });
        notes.unshift(created);
        activeNote = created;
        toast('Note created!', 'success');
      }
      renderList(searchInput.value.toLowerCase());
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  // ── Delete ─────────────────────────────────────────────────────
  async function deleteNote() {
    if (!activeNote) return;
    showModal({
      title: '🗑️ Delete note?',
      body:  `Delete "<strong>${escapeHtml(activeNote.title)}</strong>"? This can't be undone.`,
      buttons: [
        { label: 'Cancel', class: 'btn-glass' },
        { label: 'Delete', class: 'btn-danger', onClick: async () => {
          try {
            await API.notes.delete(activeNote.id);
            notes = notes.filter(n => n.id !== activeNote.id);
            activeNote = null;
            noteForm.style.display    = 'none';
            placeholder.style.display = 'flex';
            renderList();
            toast('Note deleted.', 'info');
          } catch (err) { toast(err.message, 'error'); }
        }}
      ]
    });
  }

  // ── Templates ──────────────────────────────────────────────────
  function renderTemplates() {
    if (!templates.length) {
      tmplList.innerHTML = `<div class="empty-state"><div class="empty-icon">📐</div><p>No templates yet.</p></div>`;
      return;
    }
    tmplList.innerHTML = templates.map(t => `
      <div class="file-item">
        <div class="file-icon">📐</div>
        <div class="file-info">
          <div class="file-name">${escapeHtml(t.name)}</div>
          <div class="file-meta">${escapeHtml(t.category)} · ${formatDate(t.createdAt)}</div>
        </div>
        <div class="file-actions">
          <button class="btn btn-glass btn-sm" data-use="${t.id}">Use</button>
          <button class="btn btn-danger btn-sm" data-del="${t.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    tmplList.querySelectorAll('[data-use]').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = templates.find(x => x.id === btn.dataset.use);
        if (!t) return;
        // Switch to notes sub-tab and create new note with template
        document.querySelector('[data-subtab="notes-list"]').click();
        newNote();
        titleInput.value   = t.name;
        contentInput.value = t.content;
        toast('Template loaded into editor!', 'success');
      });
    });

    tmplList.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', async () => {
        try {
          await API.templates.delete(btn.dataset.del);
          templates = templates.filter(t => t.id !== btn.dataset.del);
          renderTemplates();
          toast('Template deleted.', 'info');
        } catch (err) { toast(err.message, 'error'); }
      });
    });
  }

  async function saveTemplate() {
    const name    = tmplName.value.trim();
    const content = tmplContent.value.trim();
    if (!name || !content) { toast('Name and content required.', 'error'); return; }
    try {
      const t = await API.templates.create({ name, content, category: tmplCat.value });
      templates.unshift(t);
      renderTemplates();
      tmplName.value    = '';
      tmplContent.value = '';
      toast('Template saved!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  // ── Init ───────────────────────────────────────────────────────
  async function init() {
    buildColorPicker();
    try {
      [notes, templates] = await Promise.all([API.notes.list(), API.templates.list()]);
      renderList();
      renderTemplates();
    } catch (err) { toast('Failed to load notes: ' + err.message, 'error'); }
  }

  // ── Events ─────────────────────────────────────────────────────
  newBtn.addEventListener('click', newNote);
  saveBtn.addEventListener('click', saveNote);
  deleteBtn.addEventListener('click', deleteNote);
  tmplSaveBtn.addEventListener('click', saveTemplate);
  searchInput.addEventListener('input', () => renderList(searchInput.value.toLowerCase()));

  contentInput.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); saveNote(); }
  });

  // Sub-tabs
  document.querySelectorAll('.sub-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.subtab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.subtab).classList.add('active');
    });
  });

  return { init };
})();
