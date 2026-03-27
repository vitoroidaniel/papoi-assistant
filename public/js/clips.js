/* ═══════════════════════════════════════════════════════════════
   PAOPOI — clips.js
   Clipboard snippets: save, copy, color-code, delete
═══════════════════════════════════════════════════════════════ */

const Clips = (() => {
  let clips       = [];
  let activeColor = 'blue';

  const grid       = document.getElementById('clips-grid');
  const newBtn     = document.getElementById('new-clip-btn');
  const form       = document.getElementById('new-clip-form');
  const labelIn    = document.getElementById('clip-label');
  const textIn     = document.getElementById('clip-text');
  const saveBtn    = document.getElementById('clip-save-btn');
  const cancelBtn  = document.getElementById('clip-cancel-btn');

  // Color selector
  document.querySelectorAll('.clip-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.clip-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeColor = btn.dataset.color;
    });
  });

  function render() {
    if (!clips.length) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><div class="empty-icon">📋</div><p>No snippets yet. Save frequently-used text here.</p></div>`;
      return;
    }

    grid.innerHTML = clips.map(c => `
      <div class="clip-card" data-id="${c.id}" data-color="${c.color}">
        <span class="clip-copied-badge">✓ Copied!</span>
        ${c.label ? `<div class="clip-label">${escapeHtml(c.label)}</div>` : ''}
        <div class="clip-text">${escapeHtml(c.text)}</div>
        <div class="clip-footer">
          <span class="clip-date">${formatDateTime(c.createdAt)}</span>
          <button class="btn btn-danger btn-sm" data-del="${c.id}" onclick="event.stopPropagation()">🗑️</button>
        </div>
      </div>
    `).join('');

    // Click card → copy to clipboard
    grid.querySelectorAll('.clip-card').forEach(card => {
      card.addEventListener('click', async () => {
        const clip = clips.find(c => c.id === card.dataset.id);
        if (!clip) return;
        try {
          await navigator.clipboard.writeText(clip.text);
          card.classList.add('copied');
          setTimeout(() => card.classList.remove('copied'), 1600);
          toast('Copied to clipboard!', 'success');
        } catch {
          toast('Copy failed — try clicking again.', 'error');
        }
      });
    });

    grid.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => deleteClip(btn.dataset.del));
    });
  }

  async function save() {
    const text = textIn.value.trim();
    if (!text) { toast('Snippet text is required.', 'error'); return; }
    try {
      const clip = await API.clips.create({ label: labelIn.value.trim(), text, color: activeColor });
      clips.unshift(clip);
      render();
      labelIn.value = '';
      textIn.value  = '';
      form.style.display = 'none';
      toast('Snippet saved!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  async function deleteClip(id) {
    try {
      await API.clips.delete(id);
      clips = clips.filter(c => c.id !== id);
      render();
      toast('Snippet deleted.', 'info');
    } catch (err) { toast(err.message, 'error'); }
  }

  newBtn.addEventListener('click', () => {
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
    if (form.style.display !== 'none') textIn.focus();
  });
  cancelBtn.addEventListener('click', () => { form.style.display = 'none'; });
  saveBtn.addEventListener('click', save);

  async function init() {
    try {
      clips = await API.clips.list();
      render();
    } catch (err) { toast('Failed to load snippets.', 'error'); }
  }

  return { init };
})();
