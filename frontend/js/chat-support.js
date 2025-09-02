// Shared AI Chat Support Module
// This module provides AI-powered chat functionality across all pages

//The Stress Detection function is written by ChatGPT 4.1
// Load negative terms for stress detection
let negativeTerms = [];
async function loadNegativeTerms() {
  try {
    const response = await fetch('../data/negative_terms.json');
    const data = await response.json();
    negativeTerms = data.strong_stress_terms || [];
  } catch (error) {
    // Failed to load negative terms, continue without stress detection
  }
}

// Check if message contains negative/stress terms
function containsNegativeTerms(message) {
  if (!negativeTerms.length) return false;
  
  const lowerMessage = message.toLowerCase();
  
  return negativeTerms.some(term => {
    // Handle wildcard terms (ending with *)
    if (term.endsWith('*')) {
      const baseterm = term.slice(0, -1);
      return lowerMessage.includes(baseterm);
    }
    // Handle exact matches and phrases
    return lowerMessage.includes(term.toLowerCase());
  });
}

// Show stress detection popup
function showStressDetectionPopup() {
  const existingPopup = document.getElementById('stressPopup');
  if (existingPopup) existingPopup.remove();

  const overlay = document.createElement('div');
  overlay.id = 'stressPopup';
  overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]';
  
  const popup = document.createElement('div');
  popup.className = 'bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl';
  
  const header = document.createElement('div');
  header.className = 'flex items-center gap-3 mb-4';
  header.innerHTML = `
    <div class="w-10 h-10 flex items-center justify-center bg-amber-100 rounded-full">
      <i class="ri-heart-line text-amber-600 text-xl"></i>
    </div>
    <h3 class="text-lg font-semibold text-gray-900">Self-Care Check</h3>
  `;
  
  const message = document.createElement('p');
  message.className = 'text-gray-600 mb-6';
  message.textContent = "I'm picking up signs of stress in your message. Would you like a short self-care break?";
  
  const okButton = document.createElement('button');
  okButton.className = 'px-6 py-2 bg-[#E27759] text-white rounded-lg ml-auto block';
  okButton.textContent = 'Ok';
  okButton.onclick = () => overlay.remove();
  
  popup.append(header, message, okButton);
  overlay.appendChild(popup);
  document.body.appendChild(overlay);
  
  overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
}

const API_BASE = window.API_BASE || "http://127.0.0.1:8000";

function authHeaders() {
  const token = localStorage.getItem("token") || "";
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : ""
  };
}

// This function is written by ChatGPT 4.1 to make a chat bubble
function makeBubble(text, kind) {
  const box = document.createElement("div");
  if (kind === "user") {
    box.className = "bg-[#E27759]/10 rounded-lg p-3 mb-4 ml-auto max-w-[80%]";
  } else {
    // ai or waiting share same base
    box.className = "bg-gray-100 rounded-lg p-3 mb-4 mr-auto max-w-[80%]";
  }
  const p = document.createElement("p");
  p.className = "text-sm " + (kind === "user" ? "" : "text-gray-800");
  p.textContent = text;
  box.appendChild(p);
  return box;
}

function askAI(message) {
  var url = API_BASE + "/support/chat";
  var payload = { message: String(message || "").trim() };
  return fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload)
  })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    return (data && data.reply) ? data.reply : "No reply.";
  });
}

function openChatPanel(chatSidebar) {
  chatSidebar.style.transform = "translateX(0)";
}

function closeChatPanel(chatSidebar) {
  chatSidebar.style.transform = "translateX(100%)";
}

function appendBubble(messagesEl, text, who) {
  var bubble = makeBubble(String(text || ""), who || "ai");
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}

//put the chat functions together
function initChat() {
  var chatButton  = document.getElementById("chatButton");
  var chatSidebar = document.getElementById("chatSidebar");
  var closeBtn    = document.getElementById("closeChatButton");
  var input       = document.getElementById("messageInput");
  var sendBtn     = document.getElementById("sendMessage");
  var messages    = document.getElementById("chatMessages");

  if (typeof loadNegativeTerms === "function") {
    loadNegativeTerms();
  }
  chatButton.addEventListener("click", function () {
    openChatPanel(chatSidebar);
    if (messages.children.length === 0) {
      appendBubble(messages, "Hello! I'm here to help with caregiving questions. How can I assist you today?", "ai");
    }
  });
  closeBtn.addEventListener("click", function () {
    closeChatPanel(chatSidebar);
  });
  sendBtn.addEventListener("click", function () {
    sendChat(input, sendBtn, messages);
  });
  input.addEventListener("keypress", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChat(input, sendBtn, messages);
    }
  });
}

//initiazlize the chat
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initChat);
} else {
  initChat();
}

//send the chat
function sendChat(inputEl, sendBtn, messagesEl) {
  var text = String(inputEl.value || "").trim();
  if (!text) return;

  //This is written by ChatGPT 5 to check for stress if the reminder is enabled in settings
  var selfCare = localStorage.getItem("selfCareAISupport");
  if ((selfCare === null || selfCare === "true") &&
      typeof containsNegativeTerms === "function" &&
      containsNegativeTerms(text)) {
    if (typeof showStressDetectionPopup === "function") {
      showStressDetectionPopup();
    }
  }
  // user bubble
  appendBubble(messagesEl, text, "user");
  inputEl.value = "";
  // waiting bubble
  var waitBubble = appendBubble(messagesEl, "Please wait... I'm thinking.", "ai");
  // lock input/buttons
  inputEl.disabled = true;
  sendBtn.disabled = true;

  askAI(text).then(function (reply) {
    // remove wait bubble
    if (waitBubble && waitBubble.parentNode) {
      waitBubble.parentNode.removeChild(waitBubble);
    }
    appendBubble(messagesEl, reply, "ai");

    inputEl.disabled = false;
    sendBtn.disabled = false;
    inputEl.focus();
  });
}