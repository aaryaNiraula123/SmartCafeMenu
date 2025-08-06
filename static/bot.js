document.addEventListener("DOMContentLoaded", function () {
  const chatbotIcon = document.getElementById("chatbot-icon");
  const chatbotContainer = document.getElementById("chatbot-container");
  const closeChatbot = document.getElementById("close-chatbot");
  const chatOptions = document.querySelectorAll(".chat-option");
  const chatMessages = document.getElementById("chatbot-messages");

  // Answers for the questions
  const answers = {
    "What's on the menu today?":
      "🍽️ We have a variety of delicious food items! Please check out our menu page for all the details.",

    "What are your opening hours?":
      "🕒 We're open Monday to Friday from 7:30 AM to 9:00 PM, and on weekends from 8:00 AM to 10:00 PM.",

    "Where is your cafe located?":
      "📍 We're located at BIC College, Bhrikuti Chowk, Biratnagar.",

    "Do you offer vegetarian/vegan options?":
      "🥗 Absolutely! We have several vegetarian and vegan options available, clearly marked on our menu.",

    "Do you provide home delivery or takeout?":
      "🚫 Sorry, we currently don't offer delivery. However, it's something we're considering for the future!",

    "What payment methods do you accept?":
      "💳 We accept cash, eSewa, and bank transfers.",

    "Do you have Wi-Fi for customers?":
      "📶 Yes, we offer free Wi-Fi for our customers. The network name is 'BIC' and the password is 'BICcollege123'.",

    "How can I provide feedback?":
      "📝 We'd love to hear from you! Please share your feedback <a href='feedback.html' style='color: blue; text-decoration: underline;'>here</a>.",
  };

  // Toggle chatbot visibility
  chatbotIcon.addEventListener("click", function () {
    chatbotContainer.style.display = "flex";
  });

  closeChatbot.addEventListener("click", function () {
    chatbotContainer.style.display = "none";
  });

  // Handle option clicks
  chatOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const question = this.getAttribute("data-question");
      addMessage(question, "user");

      // Simulate typing delay
      setTimeout(() => {
        const answer =
          answers[question] ||
          "I'm sorry, I don't have information about that. Please contact us directly.";
        addMessage(answer, "bot");
      }, 500);
    });
  });

  // Add message to chat
  function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(`${sender}-message`);
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
});
