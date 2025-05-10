const forbiddenNicknames = [
  "Guestisback",
  "User-2007",
  "System"
];

let userId = localStorage.getItem('userId');
let userRole = localStorage.getItem('userRole') || 'user';
let notificationsAllowed = Notification.permission === 'granted';
const messagesList = document.getElementById('messages');
const messageInput = document.getElementById('message');
const introContainer = document.getElementById('introContainer');
const chatContainer = document.getElementById('chatContainer');
let notifiedMentions = new Set();

document.addEventListener("DOMContentLoaded", () => {
  if (!userId) {
    userId = generateUserId();
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', 'user');
    registerUser(userId);
  }

  const logo = document.getElementById('logo');
  logo.onload = () => {
    setTimeout(() => {
      introContainer.style.opacity = "0";
      setTimeout(() => {
        introContainer.style.display = "none";
        chatContainer.style.opacity = "1";
        chatContainer.style.transform = "scale(1)";
      }, 1000);
    }, 2000);
  };
});

function generateUserId() {
  let newUserId = prompt("Scegli un nickname:");
  if (!newUserId) newUserId = `User-${Math.floor(Math.random() * 10000)}`;

  if (forbiddenNicknames.includes(newUserId)) {
    alert("Questo nickname non è consentito. Scegline un altro.");
    return generateUserId();
  }

  checkNicknameAvailability(newUserId).then(isAvailable => {
    if (!isAvailable) {
      alert("Questo nickname è già in uso. Scegline un altro.");
      return generateUserId();
    } else {
      return newUserId;
    }
  });
}

async function checkNicknameAvailability(nickname) {
  const response = await fetch('/users.json');
  const users = await response.json();
  return !users.includes(nickname);
}

async function registerUser(userId) {
  const response = await fetch('/users.json');
  const users = await response.json();
  if (!users.includes(userId)) {
    users.push(userId);
    await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(users)
    });
  }
}

function sendMessage() {
  const msg = messageInput.value.trim();
  if (msg) {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          notificationsAllowed = true;
        }
      });
    }
    const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp))/i;
    const match = msg.match(imageUrlRegex);
    let messageData = {
      userId,
      role: userRole,
      message: msg,
      messageId: `${msg}-${Date.now()}`,
      timestamp: Date.now(),
      imageUrl: match ? match[0] : null
    };

    fetch('/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(messageData) })
      .then(() => {
        messageInput.value = '';
      });
  }
}

function loadMessages() {
  fetch('/messages')
    .then(response => response.json())
    .then(data => {
      messagesList.innerHTML = '';
      data.forEach(msg => {
        const li = document.createElement('li');
        li.classList.add('message');
        const messageHeader = document.createElement('div');
        messageHeader.classList.add('message-header');

        const messageUsername = document.createElement('span');
        messageUsername.classList.add('message-username');
        messageUsername.textContent = msg.userId;

        const messageRole = document.createElement('span');
        messageRole.classList.add('message-role');
        messageRole.textContent = msg.role || '';

        messageHeader.appendChild(messageUsername);
        messageHeader.appendChild(messageRole);

        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = msg.message;

        if (msg.imageUrl) {
          const image = document.createElement('img');
          image.src = msg.imageUrl;
          image.style.maxWidth = '100%';
          messageContent.appendChild(image);
        }

        if (msg.message.includes('@' + userId) && !notifiedMentions.has(msg.messageId)) {
          messageContent.classList.add('mention');
          showNotification(`@${msg.userId} ti ha menzionato: ${msg.message}`);
          notifiedMentions.add(msg.messageId);
        }

        const messageTimestamp = document.createElement('span');
        messageTimestamp.classList.add('message-timestamp');
        messageTimestamp.textContent = new Date(msg.timestamp).toLocaleString();

        li.appendChild(messageHeader);
        li.appendChild(messageContent);
        li.appendChild(messageTimestamp);

        messagesList.appendChild(li);
      });
    });
}

function showNotification(message) {
  if (notificationsAllowed) {
    new Notification('Un messaggio', { body: message });
  }
}

setInterval(loadMessages, 1000);
