// main.js

// DOM Elements
const chatToggle   = document.getElementById('chat-toggle');
const chatModal    = document.getElementById('chat-modal');
const closeChat    = document.getElementById('close-chat');
const messageInput = document.getElementById('message-input');
const sendButton   = document.getElementById('send-message');
const chatMessages = document.getElementById('chat-messages');

// Show/hide chat modal
chatToggle.addEventListener('click', () => {
  chatModal.style.display = chatModal.style.display === 'flex' ? 'none' : 'flex';
});
closeChat.addEventListener('click', () => {
  chatModal.style.display = 'none';
});

// Utility to append a message
function addMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.className = `chat-message ${isUser ? 'user' : 'bot'}`;
  msg.innerHTML = `<div class="message-content">${text}</div>`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send & receive
async function handleSend() {
  const text = messageInput.value.trim();
  if (!text) return;
  addMessage(text, true);
  messageInput.value = '';

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || res.statusText);
    }
    const { reply } = await res.json();
    addMessage(reply);
  } catch (e) {
    console.error('Chat error:', e);
    addMessage('Sorry, something went wrong.');
  }
}

// Wire up send events
sendButton.addEventListener('click', handleSend);
messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleSend();
});
