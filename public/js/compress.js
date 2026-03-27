/* ═══════════════════════════════════════════════════════════════
   PAOPOI — compress.js
   Image compressor: drag-drop, quality, format, batch
═══════════════════════════════════════════════════════════════ */

const Compress = (() => {
  const dropZone     = document.getElementById('img-drop-zone');
  const input        = document.getElementById('img-input');
  const qualSlider   = document.getElementById('quality-slider');
  const qualVal      = document.getElementById('quality-val');
  const maxWidthIn   = document.getElementById('max-width-input');
  const resultsEl    = document.getElementById('compress-results');

  let currentFormat = 'jpeg';

  // Format picker
  document.querySelectorAll('.format-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.format-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFormat = btn.dataset.fmt;
    });
  });

  qualSlider.addEventListener('input', () => { qualVal.textContent = qualSlider.value; });

  async function compressFile(file) {
    const card = document.createElement('div');
    card.className = 'card compress-result-card';
    card.innerHTML = `<div class="card-title">🖼️ ${escapeHtml(file.name)}</div><div style="text-align:center;padding:20px;color:var(--text-muted)">Compressing…</div>`;
    resultsEl.prepend(card);

    const form = new FormData();
    form.append('image', file);
    form.append('quality', qualSlider.value);
    form.append('format', currentFormat);
    form.append('maxWidth', maxWidthIn.value || '0');

    try {
      const result = await API.compress.compress(form);

      const ext   = result.format;
      const mime  = result.mimeType;
      const src   = `data:${mime};base64,${result.data}`;
      const origSrc = URL.createObjectURL(file);
      const savingsClass = result.savings >= 0 ? '' : 'warn';
      const savingsLabel = result.savings >= 0 ? `${result.savings}% saved` : `${Math.abs(result.savings)}% larger`;

      card.innerHTML = `
        <div class="card-title">🖼️ ${escapeHtml(file.name)}</div>
        <div class="compress-stats">
          <span class="stat-badge ${savingsClass}">📦 ${savingsLabel}</span>
          <span style="font-size:0.83rem;color:var(--text-muted)">${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)}</span>
          <span style="font-size:0.83rem;color:var(--text-muted)">${result.originalWidth}×${result.originalHeight} → ${result.outWidth}×${result.outHeight}</span>
        </div>
        <div class="compress-result-grid">
          <div>
            <div style="font-size:0.78rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">Original</div>
            <div class="result-img-wrap"><img src="${origSrc}" alt="original"/></div>
          </div>
          <div>
            <div style="font-size:0.78rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:6px">Compressed (${ext.toUpperCase()})</div>
            <div class="result-img-wrap"><img src="${src}" alt="compressed"/></div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn-primary" href="${src}" download="${file.name.replace(/\.[^.]+$/, '')}_compressed.${ext}">⬇️ Download compressed</a>
          <button class="btn btn-danger btn-sm" onclick="this.closest('.compress-result-card').remove()">Remove</button>
        </div>
      `;
    } catch (err) {
      card.innerHTML = `<div class="card-title">❌ ${escapeHtml(file.name)}</div><p style="color:#dc2626">${escapeHtml(err.message)}</p>`;
    }
  }

  async function handleFiles(fileList) {
    const images = fileList.filter(f => f.type.startsWith('image/'));
    if (!images.length) { toast('No valid images found.', 'error'); return; }
    for (const f of images) await compressFile(f);
    input.value = '';
  }

  setupDropZone(dropZone, input, handleFiles);

  return {};
})();
