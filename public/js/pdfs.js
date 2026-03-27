/* ═══════════════════════════════════════════════════════════════
   PAOPOI — pdfs.js
   PDF Renamer: upload, rename, bulk pattern, download
═══════════════════════════════════════════════════════════════ */

const PDFs = (() => {
  let pdfs = [];

  const dropZone       = document.getElementById('pdf-drop-zone');
  const input          = document.getElementById('pdf-input');
  const listEl         = document.getElementById('pdf-list');
  const patternBtn     = document.getElementById('pdf-pattern-btn');
  const patternPanel   = document.getElementById('pdf-pattern-panel');
  const downloadAllBtn = document.getElementById('pdf-download-all-btn');
  const patternApply   = document.getElementById('pattern-apply-btn');

  function render() {
    if (!pdfs.length) {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📄</div><p>No PDFs uploaded yet.</p></div>`;
      return;
    }

    listEl.innerHTML = pdfs.map(p => `
      <div class="pdf-item" data-id="${p.id}">
        <div class="pdf-icon">📄</div>
        <div class="pdf-names">
          <div class="pdf-original">Original: ${escapeHtml(p.originalName)}</div>
          <input class="pdf-rename-input" type="text" value="${escapeHtml(p.newName)}" data-id="${p.id}" placeholder="New name (without .pdf)" />
        </div>
        <a class="btn btn-glass btn-sm" href="${API.pdfs.download(p.filename)}?name=${encodeURIComponent(p.newName)}" download="${p.newName}.pdf">⬇️</a>
        <button class="btn btn-danger btn-sm" data-del="${p.id}">🗑️</button>
      </div>
    `).join('');

    // Save on blur/Enter for each rename input
    listEl.querySelectorAll('.pdf-rename-input').forEach(inp => {
      const saveRename = async () => {
        const id      = inp.dataset.id;
        const newName = inp.value.trim().replace(/\.pdf$/i, '') || 'untitled';
        try {
          const updated = await API.pdfs.rename(id, newName);
          pdfs = pdfs.map(p => p.id === id ? updated : p);
          toast('Renamed!', 'success');
        } catch (err) { toast(err.message, 'error'); }
      };
      inp.addEventListener('blur', saveRename);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') inp.blur(); });
    });

    listEl.querySelectorAll('[data-del]').forEach(btn => {
      btn.addEventListener('click', () => deletePDF(btn.dataset.del));
    });
  }

  async function upload(fileList) {
    const pdfsOnly = fileList.filter(f => f.name.toLowerCase().endsWith('.pdf'));
    if (!pdfsOnly.length) { toast('Only PDF files are accepted.', 'error'); return; }

    const form = new FormData();
    pdfsOnly.forEach(f => form.append('pdfs', f));
    try {
      const entries = await API.pdfs.upload(form);
      pdfs.unshift(...entries);
      render();
      toast(`Uploaded ${entries.length} PDF(s)`, 'success');
    } catch (err) { toast('Upload failed: ' + err.message, 'error'); }
    input.value = '';
  }

  async function deletePDF(id) {
    const p = pdfs.find(x => x.id === id);
    showModal({
      title: '🗑️ Delete PDF?',
      body:  `Delete "<strong>${escapeHtml(p?.originalName || '')}</strong>"?`,
      buttons: [
        { label: 'Cancel', class: 'btn-glass' },
        { label: 'Delete', class: 'btn-danger', onClick: async () => {
          try {
            await API.pdfs.delete(id);
            pdfs = pdfs.filter(x => x.id !== id);
            render();
            toast('PDF deleted.', 'info');
          } catch (err) { toast(err.message, 'error'); }
        }}
      ]
    });
  }

  // Bulk pattern rename
  patternApply.addEventListener('click', async () => {
    const prefix = document.getElementById('pattern-prefix').value;
    const start  = parseInt(document.getElementById('pattern-start').value) || 1;
    const pad    = parseInt(document.getElementById('pattern-pad').value) || 3;
    const suffix = document.getElementById('pattern-suffix').value;

    for (let i = 0; i < pdfs.length; i++) {
      const num     = String(start + i).padStart(pad, '0');
      const newName = `${prefix}${num}${suffix}`;
      try {
        const updated = await API.pdfs.rename(pdfs[i].id, newName);
        pdfs[i] = updated;
      } catch {}
    }
    render();
    toast('Pattern applied to all PDFs!', 'success');
  });

  // Toggle pattern panel
  patternBtn.addEventListener('click', () => {
    const hidden = patternPanel.style.display === 'none';
    patternPanel.style.display = hidden ? 'block' : 'none';
    patternBtn.textContent = hidden ? '✖ Close pattern' : '🔢 Apply pattern';
  });

  // Download all (one by one via hidden anchor)
  downloadAllBtn.addEventListener('click', () => {
    if (!pdfs.length) { toast('No PDFs to download.', 'info'); return; }
    pdfs.forEach((p, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href     = `${API.pdfs.download(p.filename)}?name=${encodeURIComponent(p.newName)}`;
        a.download = `${p.newName}.pdf`;
        a.click();
      }, i * 400);
    });
  });

  async function init() {
    try {
      pdfs = await API.pdfs.list();
      render();
    } catch (err) { toast('Failed to load PDFs.', 'error'); }
  }

  setupDropZone(dropZone, input, upload);

  return { init };
})();
