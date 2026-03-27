/* ═══════════════════════════════════════════════════════════════
   PAOPOI v2 — app.js
   Tab routing · welcome · keyboard shortcuts · lucide refresh
═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Welcome ──────────────────────────────────────────────────
  const welcome = document.getElementById('welcome');
  setTimeout(() => welcome.classList.add('hide'), 2800);

  // ── Icons (initial render) ───────────────────────────────────
  // lucide.createIcons() called in HTML after scripts; also call after DOM ready
  if (window.lucide) lucide.createIcons();

  // ── Tab routing ──────────────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const panels   = document.querySelectorAll('.tab-panel');

  function switchTab(tabId) {
    navItems.forEach(n => n.classList.toggle('active', n.dataset.tab === tabId));
    panels.forEach(p   => p.classList.toggle('active', p.id === `tab-${tabId}`));
    localStorage.setItem('paopoi-tab', tabId);
    // Re-render lucide icons (dynamic content may have been added)
    if (window.lucide) lucide.createIcons();
  }

  navItems.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  const lastTab = localStorage.getItem('paopoi-tab') || 'chat';
  switchTab(lastTab);

  // ── Keyboard shortcuts ────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.altKey) {
      const map = {'1':'chat','2':'notes','3':'files','4':'compress','5':'pdfs','6':'clips','0':'settings'};
      if (map[e.key]) { e.preventDefault(); switchTab(map[e.key]); }
    }
  });

  // ── Init modules ─────────────────────────────────────────────
  Notes.init();
  Files.init();
  PDFs.init();
  Clips.init();
  Settings.init();

  // Re-run icons after each module init (they may have rendered DOM)
  setTimeout(() => { if (window.lucide) lucide.createIcons(); }, 400);
});
