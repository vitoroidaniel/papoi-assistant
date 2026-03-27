/* ═══════════════════════════════════════════════════════════════
   PAOPOI — settings.js
   API key management, accent color, persisted prefs
═══════════════════════════════════════════════════════════════ */

const Settings = (() => {
  const keyInput   = document.getElementById('grok-key-input');
  const keySaveBtn = document.getElementById('grok-key-save-btn');
  const keyStatus  = document.getElementById('grok-key-status');

  async function saveKey() {
    const key = keyInput.value.trim();
    try {
      await API.settings.save({ grokApiKey: key });
      keyInput.value = '';
      keyStatus.innerHTML = `✅ API key saved! <a href="https://console.x.ai" target="_blank" style="color:var(--accent2)">console.x.ai</a>`;
      toast('Grok API key saved!', 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  function applyAccent(color) {
    document.documentElement.style.setProperty('--accent', color);
    // Darken by ~10% for hover (simple hex manipulation)
    document.documentElement.style.setProperty('--accent-hover', color);
    localStorage.setItem('paopoi-accent', color);
  }

  document.querySelectorAll('.accent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.accent-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyAccent(btn.dataset.color);
      toast('Accent color updated!', 'success');
    });
  });

  keySaveBtn.addEventListener('click', saveKey);
  keyInput.addEventListener('keydown', e => { if (e.key === 'Enter') saveKey(); });

  async function init() {
    // Restore saved accent
    const savedAccent = localStorage.getItem('paopoi-accent');
    if (savedAccent) {
      applyAccent(savedAccent);
      document.querySelectorAll('.accent-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === savedAccent);
      });
    }

    // Check if key is set
    try {
      const s = await API.settings.get();
      if (s.grokApiKeySet) {
        keyStatus.innerHTML = `✅ API key is configured. <a href="https://console.x.ai" target="_blank" style="color:var(--accent2)">console.x.ai</a>`;
      }
    } catch {}
  }

  return { init };
})();
