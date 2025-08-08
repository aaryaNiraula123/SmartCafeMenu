document.addEventListener("DOMContentLoaded", function () {
  const chatbotIcon = document.getElementById("chatbot-icon");
  const chatbotContainer = document.getElementById("chatbot-container");
  const closeChatbot = document.getElementById("close-chatbot");
  const chatMessages = document.getElementById("chatbot-messages");
  const chatbotOptions = document.getElementById("chatbot-options");

  // Questions & Answers (keys are normalized questions)
  const qa = {
    "what's on the menu today":
      "🍽️ We have a variety of delicious food items! Please check out our menu page for all the details.",
    "what are your opening hours":
      "🕒 We're open Monday to Friday from 7:30 AM to 9:00 PM, and on weekends from 8:00 AM to 10:00 PM.",
    "where is your cafe located":
      "📍 We're located at BIC College, Bhrikuti Chowk, Biratnagar.",
    "can i reserve a table":
      "📅 Yes! You can reserve a table by calling us or visiting in person.",
    "do you offer vegetarian/vegan options":
      "🥗 Absolutely! We have several vegetarian and vegan options available, clearly marked on our menu.",
    "do you provide home delivery or takeout":
      "🚫 Sorry, we currently don't offer delivery. However, it's something we're considering for the future!",
    "what payment methods do you accept":
      "💳 We accept cash, eSewa, and bank transfers.",
    "do you take custom cake or event orders":
      "🎂 Yes, we do! Please contact us for custom cake or event order details.",
    "do you have wi-fi for customers":
      "📶 Yes, we offer free Wi-Fi for our customers. The network name is 'BIC' and the password is 'BICcollege123'.",
    "how can i provide feedback":
      "📝 You can provide feedback by clicking <a href='/feedback' target='_blank' style='color: blue; text-decoration: underline;'>here</a>.",
  };

  // Function to normalize text keys
  function normalize(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\w\s]/gi, "");
  }

  // Create buttons dynamically from questions
  Object.keys(qa).forEach((question) => {
    const button = document.createElement("button");
    button.classList.add("chat-option");
    button.textContent = question.charAt(0).toUpperCase() + question.slice(1);
    button.dataset.question = question; // store normalized question for lookup
    chatbotOptions.appendChild(button);
  });

  // Toggle chatbot visibility
  chatbotIcon.addEventListener("click", () => {
    chatbotContainer.style.display = "flex";
  });

  closeChatbot.addEventListener("click", () => {
    chatbotContainer.style.display = "none";
  });

  // Handle option clicks
  chatbotOptions.addEventListener("click", (e) => {
    if (e.target.classList.contains("chat-option")) {
      const question = e.target.dataset.question;
      addMessage(question, "user");

      // Simulate typing delay and respond
      setTimeout(() => {
        const answer =
          qa[question] ||
          "❓ Sorry, I don't have information on that. Please contact us directly.";
        addMessage(answer, "bot");
      }, 500);
    }
  });

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(`${sender}-message`);
    messageDiv.innerHTML = text; // support links in answers
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
