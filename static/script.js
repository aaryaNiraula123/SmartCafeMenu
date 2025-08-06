let cart = [];
let currentTableNumber = 1; // Default table number

document.addEventListener("DOMContentLoaded", () => {
  // Extract table number from URL (e.g., /menu/1)
  const pathParts = window.location.pathname.split("/");
  if (pathParts.length >= 3 && !isNaN(pathParts[2])) {
    currentTableNumber = parseInt(pathParts[2]);
  }

  // Load saved cart from localStorage (table-specific)
  const storedCart = localStorage.getItem(`cart_table_${currentTableNumber}`);
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }

  showVegItems(); // default tab
  initModals();
});

// Initialize all modal related event listeners
function initModals() {
  // Order confirmation modal
  const orderModal = document.getElementById("order-modal");
  const successModal = document.getElementById("success-modal");
  const clearCartModal = document.getElementById("clear-cart-modal");

  document.querySelector(".close-modal")?.addEventListener("click", () => {
    orderModal.style.display = "none";
  });

  document.getElementById("cancel-order")?.addEventListener("click", () => {
    orderModal.style.display = "none";
  });

  document
    .getElementById("confirm-order")
    ?.addEventListener("click", confirmOrder);

  // Success modal
  document.getElementById("success-ok")?.addEventListener("click", () => {
    successModal.style.display = "none";
    window.location.href = `/menu/${currentTableNumber}`;
  });

  // Clear cart modal
  document.getElementById("cancel-clear")?.addEventListener("click", () => {
    clearCartModal.style.display = "none";
  });

  document.getElementById("confirm-clear")?.addEventListener("click", () => {
    performCartReset();
    clearCartModal.style.display = "none";
  });

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === orderModal) {
      orderModal.style.display = "none";
    }
    if (event.target === successModal) {
      successModal.style.display = "none";
      window.location.href = `/menu/${currentTableNumber}`;
    }
    if (event.target === clearCartModal) {
      clearCartModal.style.display = "none";
    }
  });
}

function addToCart(itemName, itemPrice) {
  const existingItem = cart.find((item) => item.name === itemName);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name: itemName, price: itemPrice, quantity: 1 });
  }
  updateCartStorage();
  updateCart();
  showCartAnimation(itemName);
}

function showCartAnimation(itemName) {
  const notification = document.createElement("div");
  notification.className = "cart-notification";
  notification.textContent = `Added ${itemName} to cart!`;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}

function updateCart() {
  const cartItemsElement = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  cartItemsElement.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-name">${item.name}</span>
      <div class="item-quantity-controls">
        <button class="quantity-btn minus" data-name="${item.name}">-</button>
        <span class="quantity">x${item.quantity}</span>
        <button class="quantity-btn plus" data-name="${item.name}">+</button>
      </div>
      <span class="item-price">Rs. ${item.price * item.quantity}</span>
      <button class="remove-btn" data-name="${item.name}">×</button>
    `;
    cartItemsElement.appendChild(li);
    total += item.price * item.quantity;
  });

  // Add event listeners for quantity controls
  document.querySelectorAll(".quantity-btn.minus").forEach((btn) => {
    btn.addEventListener("click", decreaseQuantity);
  });

  document.querySelectorAll(".quantity-btn.plus").forEach((btn) => {
    btn.addEventListener("click", increaseQuantity);
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", removeItem);
  });

  cartTotalElement.innerHTML = `Total: <span class="total-amount">Rs. ${total}</span>`;
}

function decreaseQuantity(e) {
  const itemName = e.target.dataset.name;
  const item = cart.find((item) => item.name === itemName);

  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart = cart.filter((item) => item.name !== itemName);
  }

  updateCartStorage();
  updateCart();
}

function increaseQuantity(e) {
  const itemName = e.target.dataset.name;
  const item = cart.find((item) => item.name === itemName);
  item.quantity++;

  updateCartStorage();
  updateCart();
}

function removeItem(e) {
  const itemName = e.target.dataset.name;
  cart = cart.filter((item) => item.name !== itemName);

  updateCartStorage();
  updateCart();
}

function updateCartStorage() {
  localStorage.setItem(
    `cart_table_${currentTableNumber}`,
    JSON.stringify(cart)
  );
}

function resetCart() {
  if (cart.length === 0) {
    showEmptyCartNotification();
    return;
  }
  document.getElementById("clear-cart-modal").style.display = "block";
}

function performCartReset() {
  cart = [];
  localStorage.removeItem(`cart_table_${currentTableNumber}`);
  updateCart();

  const notification = document.createElement("div");
  notification.className = "cart-notification reset";
  notification.textContent = "Cart has been cleared!";
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}

function finalOrder() {
  if (cart.length === 0) {
    showEmptyCartNotification();
    return;
  }
  showOrderConfirmation();
}

function showOrderConfirmation() {
  const orderItemsList = document.getElementById("order-items-list");
  const modalTotalAmount = document.getElementById("modal-total-amount");

  // Clear previous items
  orderItemsList.innerHTML = "";

  // Add current items
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.quantity} - Rs. ${
      item.price * item.quantity
    }`;
    orderItemsList.appendChild(li);
  });

  // Calculate and display total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  modalTotalAmount.textContent = `Rs. ${total}`;

  // Set the table number in the modal
  document.getElementById("table-number").value = currentTableNumber;

  // Show the modal
  document.getElementById("order-modal").style.display = "block";
}

function showEmptyCartNotification() {
  const notification = document.createElement("div");
  notification.className = "cart-notification error";
  notification.textContent = "Your cart is empty!";
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("fade-out");
    setTimeout(() => notification.remove(), 500);
  }, 2000);
}

function confirmOrder() {
  try {
    const customerName = document.getElementById("customer-name").value.trim();
    const tableNumber = document.getElementById("table-number").value;

    if (!customerName) {
      alert("Please enter your name to confirm the order.");
      return;
    }

    if (!tableNumber) {
      alert("Please select your table number.");
      return;
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const orderData = {
      user_name: customerName,
      table_number: parseInt(tableNumber),
      items: cart,
      total: total,
    };

    console.log("Order data being sent:", orderData);

    fetch("/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((err) => {
            throw new Error(err.error || "Server error");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log("Order success:", data);
        cart = [];
        localStorage.removeItem(`cart_table_${tableNumber}`);
        updateCart();

        document.getElementById("order-modal").style.display = "none";
        document.getElementById(
          "success-message"
        ).textContent = `Thank you, ${customerName}! Your order for Table ${tableNumber} (Rs. ${total}) has been placed.`;
        document.getElementById("success-modal").style.display = "block";
      })
      .catch((error) => {
        console.error("Order submission failed:", error);
        alert(`Order failed: ${error.message}`);
      });
  } catch (error) {
    console.error("Error in confirmOrder:", error);
    alert("An unexpected error occurred. Please try again.");
  }
}

// Tab display functions
function showTab(tabId) {
  const contents = document.querySelectorAll(".tab-content");
  const tabs = document.querySelectorAll(".tab");

  contents.forEach((content) => (content.style.display = "none"));
  tabs.forEach((tab) => tab.classList.remove("active"));

  const activeContent = document.getElementById(tabId);
  const activeTab = document.querySelector(`.tab[onclick*="${tabId}"]`);

  if (activeContent) activeContent.style.display = "block";
  if (activeTab) activeTab.classList.add("active");
}

function showVegItems() {
  showTab("vegcontents");
}

function showNonVegItems() {
  showTab("nonvegcontents");
}

function showdrinks() {
  showTab("drinkcontents");
}

function showdesert() {
  showTab("desertcontents");
}

// Search menu items
function searchMenu() {
  const input = document.getElementById("searchInput").value.toLowerCase();
  const menuCards = document.querySelectorAll(".menu-card");
  const noResults = document.getElementById("no-results");

  let hasResults = false;

  menuCards.forEach((card) => {
    const itemName = card.querySelector("h4").textContent.toLowerCase();
    const isVisible = itemName.includes(input);
    card.style.display = isVisible ? "block" : "none";

    if (isVisible) hasResults = true;
  });

  if (noResults) {
    noResults.style.display = hasResults ? "none" : "block";
  }
}

// Sort menu items
function filterMenu() {
  const value = document.getElementById("filter").value;
  const activeTabContent = document.querySelector(
    '.tab-content[style*="block"]'
  );

  if (!activeTabContent) return;

  const cards = Array.from(activeTabContent.querySelectorAll(".menu-card"));
  const grid = activeTabContent.querySelector(".menu-grid");

  if (!grid) return;

  let sortedCards = [...cards];

  if (value === "price-asc") {
    sortedCards.sort((a, b) => {
      const priceA = parseInt(
        a.querySelector("p").textContent.replace("Rs. ", "")
      );
      const priceB = parseInt(
        b.querySelector("p").textContent.replace("Rs. ", "")
      );
      return priceA - priceB;
    });
  } else if (value === "price-desc") {
    sortedCards.sort((a, b) => {
      const priceA = parseInt(
        a.querySelector("p").textContent.replace("Rs. ", "")
      );
      const priceB = parseInt(
        b.querySelector("p").textContent.replace("Rs. ", "")
      );
      return priceB - priceA;
    });
  }

  grid.innerHTML = "";
  sortedCards.forEach((card) => grid.appendChild(card));
}
