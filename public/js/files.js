/* ═══════════════════════════════════════════════════════════════
   PAOPOI — files.js
   File library: upload, list, download, delete txt/md/csv etc.
═══════════════════════════════════════════════════════════════ */

const Files = (() => {
  let files = [];

  const dropZone = document.getElementById('file-drop-zone');
  const input    = document.getElementById('file-input');
  const listEl   = document.getElementById('file-list');

  const EXT_ICONS = {
    txt:  '📄', md: '📝', csv: '📊', json: '🔧',
    xml:  '🗂️', log: '📋', yaml: '⚙️', yml: '⚙️'
  };

  function getIcon(name) {
    const ext = name.split('.').pop().toLowerCase();
    return EXT_ICONS[ext] || '📄';
  }

  function render() {
    if (!files.length) {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📂</div><p>No files uploaded yet.</p></div>`;
      return;
    }
    listEl.innerHTML = files.map(f => `
      <div class="file-item">
        <div class="file-icon">${getIcon(f.originalName)}</div>
        <div class="file-info">
          <div class="file-name">${escapeHtml(f.originalName)}</div>
          <div class="file-meta">${formatBytes(f.size)} · ${formatDate(f.uploadedAt)}</div>
        </div>
        <div class="file-actions">
          <a class="btn btn-glass btn-sm" href="${API.files.download(f.filename)}" download="${f.originalName}">⬇️</a>
          <button class="btn btn-danger btn-sm" data-del="${f.id}">🗑️</button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => deleteFile(btn.dataset.del));
    });
  }

  async function upload(fileList) {
    for (const file of fileList) {
      const form = new FormData();
      form.append('file', file);
      try {
        const entry = await API.files.upload(form);
        files.unshift(entry);
        render();
        toast(`Uploaded: ${file.name}`, 'success');
      } catch (err) {
        toast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      }
    }
    input.value = '';
  }

  async function deleteFile(id) {
    const f = files.find(x => x.id === id);
    showModal({
      title: '🗑️ Delete file?',
      body:  `Delete "<strong>${escapeHtml(f?.originalName || '')}</strong>"?`,
      buttons: [
        { label: 'Cancel', class: 'btn-glass' },
        { label: 'Delete', class: 'btn-danger', onClick: async () => {
          try {
            await API.files.delete(id);
            files = files.filter(x => x.id !== id);
            render();
            toast('File deleted.', 'info');
          } catch (err) { toast(err.message, 'error'); }
        }}
      ]
    });
  }

  async function init() {
    try {
      files = await API.files.list();
      render();
    } catch (err) { toast('Failed to load files.', 'error'); }
  }

  setupDropZone(dropZone, input, upload);

  return { init };
})();
