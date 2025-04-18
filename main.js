// === main.js ===

// DOM Elements
const themeToggle   = document.getElementById('theme-toggle');
const body          = document.body;
const hamburger     = document.querySelector('.hamburger');
const navLinks      = document.querySelector('.nav-links');
const chatToggle    = document.getElementById('chat-toggle');
const chatModal     = document.getElementById('chat-modal');
const closeChat     = document.getElementById('close-chat');
const messageInput  = document.getElementById('message-input');
const sendMessage   = document.getElementById('send-message');
const chatMessages  = document.getElementById('chat-messages');

// --- Theme Toggle ---
function loadTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  } else {
    body.classList.remove('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  }
}

function toggleTheme() {
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
  } else {
    body.classList.add('dark-theme');
    localStorage.setItem('theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
  }
}

themeToggle.addEventListener('click', toggleTheme);
loadTheme();

// --- Mobile Nav ---
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  hamburger.classList.toggle('active');
});
document.querySelectorAll('.nav-links a').forEach(link =>
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    hamburger.classList.remove('active');
  })
);

// --- Scroll Animations ---
const observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
      obs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.section > *').forEach(el => observer.observe(el));

// --- Chat Widget Show/Hide ---
chatToggle.addEventListener('click', () => {
  chatModal.style.display = chatModal.style.display === 'flex' ? 'none' : 'flex';
});
closeChat.addEventListener('click', () => {
  chatModal.style.display = 'none';
});

// --- Chat Message Helpers ---
function addMessage(text, isUser = false) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('chat-message', isUser ? 'user' : 'bot');
  const content = document.createElement('div');
  content.classList.add('message-content');
  content.textContent = text;
  wrapper.appendChild(content);
  chatMessages.appendChild(wrapper);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// --- Send / Receive ---
async function handleSendMessage() {
  const msg = messageInput.value.trim();
  if (!msg) return;
  addMessage(msg, true);
  messageInput.value = '';

  try {
    const reply = await sendMessageToAI(msg);
    addMessage(reply);
  } catch (err) {
    console.error(err);
    addMessage('Sorry something went wrong.');
  }
}

sendMessage.addEventListener('click', handleSendMessage);
messageInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') handleSendMessage();
});

// --- AI API Call ---
async function sendMessageToAI(text) {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
  
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Network error');
    }
  
    const { reply } = await res.json();
    return reply;
  }

// --- Project Section Animation Delays ---
document.querySelectorAll('.project-card').forEach((card, i) => {
  card.style.animationDelay = `${i * 0.2}s`;
});

// --- Fade‑in Page Load Animations ---
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.section').forEach((sec, i) => {
    sec.style.opacity = '0';
    sec.style.transition = `opacity 0.5s ease ${i * 0.1}s`;
    setTimeout(() => (sec.style.opacity = '1'), 100);
  });
});
