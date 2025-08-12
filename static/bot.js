// DOM elements
const openBtn = document.getElementById("open-chat-btn");
const botContainer = document.getElementById("chatbot-container");
const closeBtn = document.getElementById("close-chatbot");
const messages = document.getElementById("chatbot-messages");
const options = document.getElementById("chatbot-options");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-msg");

// Open chatbot panel
function openChatbot() {
  botContainer.style.display = "flex";
  botContainer.style.animation = "slideUp 0.3s ease forwards";
  userInput.focus();
}

// Close chatbot panel
function closeChatbot() {
  botContainer.style.animation = "fadeOut 0.2s forwards";
  setTimeout(() => {
    botContainer.style.display = "none";
  }, 200);
}

if (openBtn) openBtn.addEventListener("click", openChatbot);
if (closeBtn) closeBtn.addEventListener("click", closeChatbot);

// FAQ data
const FAQ = [
  {
    q: "what's on the menu today",
    a: "🍽️ We have a variety of delicious food items! Please check out our menu page for all the details.",
  },
  {
    q: "what are your opening hours",
    a: "🕒 We're open Monday to Friday from 7:30 AM to 9:00 PM, and on weekends from 8:00 AM to 10:00 PM.",
  },
  {
    q: "where is your cafe located",
    a: "📍 We're located at BIC College, Bhrikuti Chowk, Biratnagar.",
  },
  {
    q: "can i reserve a table",
    a: "📅 Yes! You can reserve a table by calling us or visiting in person.",
  },
  {
    q: "do you offer vegetarian/vegan options",
    a: "🥗 Absolutely! We have several vegetarian and vegan options available, clearly marked on our menu.",
  },
  {
    q: "do you provide home delivery or takeout",
    a: "🚫 Sorry, we currently don't offer delivery. However, it's something we're considering for the future!",
  },
  {
    q: "what payment methods do you accept",
    a: "💳 We accept cash, eSewa, and bank transfers.",
  },
  {
    q: "do you take custom cake or event orders",
    a: "🎂 Yes, we do! Please contact us for custom cake or event order details.",
  },
  {
    q: "do you have wi-fi for customers",
    a: "📶 Yes, we offer free Wi-Fi for our customers. The network name is 'BIC' and the password is 'BICcollege123'.",
  },
  {
    q: "how can i provide feedback",
    a: "📝 You can provide feedback by clicking <a href='/feedback' target='_blank' style='color: blue; text-decoration: underline;'>here</a>.",
  },
];

// Append bot message to chat
function addBotMessage(text) {
  const d = document.createElement("div");
  d.className = "bot-message";
  d.innerHTML = text;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

// Append user message to chat
function addUserMessage(text) {
  const d = document.createElement("div");
  d.className = "user-message";
  d.innerText = text;
  messages.appendChild(d);
  messages.scrollTop = messages.scrollHeight;
}

// Create quick FAQ buttons
function createFAQButtons() {
  options.innerHTML = ""; // clear existing buttons
  FAQ.forEach((f) => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.innerText = f.q;
    btn.onclick = () => {
      addUserMessage(f.q);
      setTimeout(() => addBotMessage(f.a), 400);
    };
    options.appendChild(btn);
  });
}
createFAQButtons();

// Message send handler
function sendMessage() {
  const txt = userInput.value.trim();
  if (!txt) return;
  addUserMessage(txt);
  userInput.value = "";

  // Improved matching: exact match or includes whole phrase (case-insensitive)
  const found = FAQ.find(
    (f) =>
      f.q.toLowerCase() === txt.toLowerCase() ||
      f.q.toLowerCase().includes(txt.toLowerCase())
  );

  setTimeout(() => {
    addBotMessage(
      found
        ? found.a
        : "❓ Sorry, I’m not sure about that. Try one of the quick options below."
    );
  }, 500);
}

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
