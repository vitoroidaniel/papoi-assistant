/* ═══════════════════════════════════════════════════════════════
   PAOPOI v3 — chat.js
═══════════════════════════════════════════════════════════════ */

const Chat = (() => {
  let history = [];

  const messagesEl = document.getElementById('chat-messages');
  const inputEl    = document.getElementById('chat-input');
  const sendBtn    = document.getElementById('chat-send-btn');
  const clearBtn   = document.getElementById('chat-clear-btn');

  function appendMsg(role, content, isThinking = false) {
    const div = document.createElement('div');
    div.className = `msg ${role === 'user' ? 'user' : 'ai'}${isThinking ? ' thinking' : ''}`;
    const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    if (isThinking) {
      div.innerHTML = `
        <div class="msg-av"><i class="ph-bold ph-sparkle"></i></div>
        <div class="msg-bub"><div class="thinking-dots"><span></span><span></span><span></span></div></div>`;
    } else {
      const html = role === 'user' ? escapeHtml(content) : renderMarkdown(content);
      div.innerHTML = `
        <div class="msg-av">${role === 'user' ? '<i class="ph-bold ph-user"></i>' : '<i class="ph-bold ph-sparkle"></i>'}</div>
        <div>
          <div class="msg-bub">${html}</div>
          <div class="msg-time">${now}</div>
        </div>`;
    }

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return div;
  }

  async function send() {
    const text = inputEl.value.trim();
    if (!text) return;
    inputEl.value = '';
    inputEl.style.height = 'auto';
    setLoading(true);
    appendMsg('user', text);
    history.push({ role: 'user', content: text });
    const thinkEl = appendMsg('ai', '', true);
    try {
      const { reply } = await API.chat.send(history);
      thinkEl.remove();
      appendMsg('ai', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      thinkEl.remove();
      appendMsg('ai', `⚠️ ${err.message}`);
    } finally {
      setLoading(false);
      inputEl.focus();
    }
  }

  function setLoading(on) {
    sendBtn.disabled = on;
    sendBtn.innerHTML = on ? '…' : '<i class="ph-bold ph-paper-plane-tilt"></i>';
  }

  clearBtn.addEventListener('click', () => {
    showModal({
      title: 'Clear chat?',
      body: 'This removes all messages from the current session.',
      buttons: [
        { label: 'Cancel', class: 'btn-ghost' },
        { label: 'Clear', class: 'btn-ghost-red', onClick: () => {
          history = [];
          messagesEl.innerHTML = '';
          appendMsg('ai', 'Chat cleared. Bello! How can I help? 🍌');
        }}
      ]
    });
  });

  sendBtn.addEventListener('click', send);
  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });
  inputEl.addEventListener('input', () => autoGrow(inputEl));

  return { send };
})();
