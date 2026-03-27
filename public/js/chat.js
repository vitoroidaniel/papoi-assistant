/* ═══════════════════════════════════════════════════════════════
   PAOPOI — chat.js
   AI Chat with Grok, message history, markdown rendering
═══════════════════════════════════════════════════════════════ */

const Chat = (() => {
  let history = []; // { role, content }

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
        <div class="msg-avatar">🍌</div>
        <div class="msg-bubble">
          <div class="thinking-dots"><span></span><span></span><span></span></div>
        </div>`;
    } else {
      const html = role === 'user' ? escapeHtml(content) : renderMarkdown(content);
      div.innerHTML = `
        <div class="msg-avatar">${role === 'user' ? '👤' : '🍌'}</div>
        <div>
          <div class="msg-bubble">${html}</div>
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

    const thinkingEl = appendMsg('ai', '', true);

    try {
      const { reply } = await API.chat.send(history);
      thinkingEl.remove();
      appendMsg('ai', reply);
      history.push({ role: 'assistant', content: reply });
    } catch (err) {
      thinkingEl.remove();
      appendMsg('ai', `⚠️ ${err.message}`);
    } finally {
      setLoading(false);
      inputEl.focus();
    }
  }

  function setLoading(on) {
    sendBtn.disabled = on;
    sendBtn.textContent = on ? '…' : 'Send ↑';
  }

  function clear() {
    showModal({
      title: '🗑️ Clear chat history?',
      body:  'This will remove all messages from the current session.',
      buttons: [
        { label: 'Cancel', class: 'btn-glass' },
        { label: 'Clear', class: 'btn-danger', onClick: () => {
          history = [];
          messagesEl.innerHTML = '';
          appendMsg('ai', 'Bello! Chat cleared. How can I help you?');
        }}
      ]
    });
  }

  // Events
  sendBtn.addEventListener('click', send);
  clearBtn.addEventListener('click', clear);

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  });

  inputEl.addEventListener('input', () => autoGrow(inputEl));

  return { send, clear };
})();
