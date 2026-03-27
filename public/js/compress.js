/* ═══════════════════════════════════════════════════════════════
   PAOPOI v3 — compress.js
═══════════════════════════════════════════════════════════════ */

const Compress = (() => {
  const dropZone   = document.getElementById('img-drop-zone');
  const input      = document.getElementById('img-input');
  const qualSlider = document.getElementById('quality-slider');
  const qualVal    = document.getElementById('quality-val');
  const maxWidthIn = document.getElementById('max-width-input');
  const resultsEl  = document.getElementById('compress-results');

  let currentFormat = 'jpeg';

  document.querySelectorAll('.fmt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.fmt-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFormat = btn.dataset.fmt;
    });
  });

  qualSlider.addEventListener('input', () => { qualVal.textContent = qualSlider.value; });

  async function compressFile(file) {
    const card = document.createElement('div');
    card.className = 'card compress-result-card';
    card.style.marginBottom = '0';
    card.innerHTML = `<div class="card-title"><i class="ph-bold ph-image"></i> ${escapeHtml(file.name)}</div><div style="text-align:center;padding:24px;color:var(--text-muted)">Compressing…</div>`;
    resultsEl.prepend(card);

    const form = new FormData();
    form.append('image', file);
    form.append('quality', qualSlider.value);
    form.append('format', currentFormat);
    form.append('maxWidth', maxWidthIn.value || '0');

    try {
      const result = await API.compress.compress(form);
      const ext = result.format;
      const src = `data:${result.mimeType};base64,${result.data}`;
      const origSrc = URL.createObjectURL(file);
      const savBadge = result.savings >= 0
        ? `<span class="badge badge-green">⬇ ${result.savings}% smaller</span>`
        : `<span class="badge badge-yellow">⬆ ${Math.abs(result.savings)}% larger</span>`;

      card.innerHTML = `
        <div class="card-title"><i class="ph-bold ph-image"></i> ${escapeHtml(file.name)}</div>
        <div class="compress-stats">
          ${savBadge}
          <span style="font-size:0.84rem;color:var(--text-muted)">${formatBytes(result.originalSize)} → ${formatBytes(result.compressedSize)}</span>
          <span style="font-size:0.84rem;color:var(--text-muted)">${result.originalWidth}×${result.originalHeight} → ${result.outWidth}×${result.outHeight}</span>
        </div>
        <div class="compress-result-grid">
          <div>
            <div style="font-size:0.75rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:7px">Original</div>
            <div class="result-img-wrap"><img src="${origSrc}" alt="original"/></div>
          </div>
          <div>
            <div style="font-size:0.75rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.07em;margin-bottom:7px">Compressed (${ext.toUpperCase()})</div>
            <div class="result-img-wrap"><img src="${src}" alt="compressed"/></div>
          </div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn-primary btn-sm" href="${src}" download="${file.name.replace(/\.[^.]+$/,'')}_compressed.${ext}">
            <i class="ph-bold ph-download-simple"></i> Download
          </a>
          <button class="btn btn-ghost btn-sm" onclick="this.closest('.compress-result-card').remove()">Remove</button>
        </div>
      `;
    } catch (err) {
      card.innerHTML = `<div class="card-title"><i class="ph-bold ph-warning"></i> ${escapeHtml(file.name)}</div><p style="color:#dc2626">${escapeHtml(err.message)}</p>`;
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
