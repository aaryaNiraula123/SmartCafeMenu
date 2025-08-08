document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("feedbackForm");

  if (!form) {
    console.error("Feedback form not found");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((el) => {
      el.style.display = "none";
    });

    let valid = true;

    // Name validation
    const nameInput = form.elements["name"];
    if (!nameInput?.value.trim()) {
      document.getElementById("nameError").style.display = "block";
      valid = false;
    }

    // Email validation
    const emailInput = form.elements["email"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput || !emailRegex.test(emailInput.value.trim())) {
      document.getElementById("emailError").style.display = "block";
      valid = false;
    }

    // Rating validation
    const ratingSelected = document.querySelector(
      'input[name="rating"]:checked'
    );
    if (!ratingSelected) {
      document.getElementById("ratingError").style.display = "block";
      valid = false;
    }

    if (!valid) return;

    // Prepare data
    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      rating: ratingSelected.value,
      comments: form.elements["comments"]?.value.trim() || "",
    };

    try {
      const response = await fetch("/submit_feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        // Replace form with custom Thank You UI
        form.style.display = "none";

        const thankYouDiv = document.createElement("div");
        thankYouDiv.className = "thank-you-container";
        thankYouDiv.innerHTML = `
          <div class="thank-you-card">
            <svg class="thank-you-icon" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z"/>
            </svg>
            <h2 class="thank-you-title">Thank you for your feedback!</h2>
            <p class="thank-you-text">${
              result.message || "We appreciate your input!"
            }</p>
            <div class="thank-you-buttons">
              <button class="thank-you-button menu-button">Go to Menu</button>
              <button class="thank-you-button submit-button">Submit Another</button>
            </div>
          </div>
        `;

        form.parentNode.appendChild(thankYouDiv);

        // Animate
        setTimeout(() => {
          thankYouDiv.classList.add("animate-in");
        }, 50);

        // Buttons
        thankYouDiv
          .querySelector(".menu-button")
          .addEventListener("click", () => {
            window.location.href = "menu.html";
          });

        thankYouDiv
          .querySelector(".submit-button")
          .addEventListener("click", () => {
            thankYouDiv.classList.remove("animate-in");
            setTimeout(() => {
              form.style.display = "block";
              form.reset();
              thankYouDiv.remove();
            }, 300);
          });
      } else {
        throw new Error(result.error || "Failed to submit feedback.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      const errorDisplay = document.createElement("div");
      errorDisplay.className = "error-message";
      errorDisplay.textContent = err.message;
      errorDisplay.style.display = "block";
      form.appendChild(errorDisplay);
    }
  });
});
