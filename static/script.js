let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  // Load saved cart from localStorage
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }
  showVegItems(); // default tab

  // Initialize modal event listeners
  initModals();
});

// Initialize all modal related event listeners
function initModals() {
  // Order confirmation modal
  document.querySelector(".close-modal")?.addEventListener("click", () => {
    document.getElementById("order-modal").style.display = "none";
  });

  document.getElementById("cancel-order")?.addEventListener("click", () => {
    document.getElementById("order-modal").style.display = "none";
  });

  document
    .getElementById("confirm-order")
    ?.addEventListener("click", confirmOrder);

  // Success modal
  document.getElementById("success-ok")?.addEventListener("click", () => {
    document.getElementById("success-modal").style.display = "none";
    window.location.href = "/menu/1";
  });

  // Clear cart modal
  document.getElementById("cancel-clear")?.addEventListener("click", () => {
    document.getElementById("clear-cart-modal").style.display = "none";
  });

  document.getElementById("confirm-clear")?.addEventListener("click", () => {
    performCartReset();
    document.getElementById("clear-cart-modal").style.display = "none";
  });

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target == document.getElementById("order-modal")) {
      document.getElementById("order-modal").style.display = "none";
    }
    if (event.target == document.getElementById("success-modal")) {
      document.getElementById("success-modal").style.display = "none";
      window.location.href = "/menu/1";
    }
    if (event.target == document.getElementById("clear-cart-modal")) {
      document.getElementById("clear-cart-modal").style.display = "none";
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
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();

  // Show add to cart animation
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

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function increaseQuantity(e) {
  const itemName = e.target.dataset.name;
  const item = cart.find((item) => item.name === itemName);
  item.quantity++;

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function removeItem(e) {
  const itemName = e.target.dataset.name;
  cart = cart.filter((item) => item.name !== itemName);

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function resetCart() {
  if (cart.length === 0) {
    showEmptyCartNotification();
    return;
  }

  // Show clear cart confirmation modal
  document.getElementById("clear-cart-modal").style.display = "block";
}

function performCartReset() {
  cart = [];
  localStorage.removeItem("cart");
  updateCart();

  // Show reset notification
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

  // Show order confirmation modal
  showOrderConfirmation();
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

function showOrderConfirmation() {
  const modal = document.getElementById("order-modal");
  const orderItemsList = document.getElementById("order-items-list");
  const modalTotalAmount = document.getElementById("modal-total-amount");

  // Clear previous items
  orderItemsList.innerHTML = "";

  // Add current items
  let total = 0;
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-name">${item.name}</span>
      <span class="item-quantity">x${item.quantity}</span>
      <span class="item-price">Rs. ${item.price * item.quantity}</span>
    `;
    orderItemsList.appendChild(li);
    total += item.price * item.quantity;
  });

  // Update total
  modalTotalAmount.textContent = `Rs. ${total}`;

  // Clear name field
  document.getElementById("customer-name").value = "";

  // Show modal
  modal.style.display = "block";
}

function confirmOrder() {
  const customerName = document.getElementById("customer-name").value.trim();

  if (!customerName) {
    alert("Please enter your name to confirm the order.");
    return;
  }

  // Prepare data
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const orderData = {
    user_name: customerName,
    items: cart,
    total: total,
  };

  // Send to server
  fetch("/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      // Hide order modal
      document.getElementById("order-modal").style.display = "none";

      // Show success modal
      document.getElementById(
        "success-message"
      ).textContent = `Thank you, ${customerName}! Your order of Rs. ${total} has been placed successfully.`;
      document.getElementById("success-modal").style.display = "block";

      // Clear cart
      cart = [];
      localStorage.removeItem("cart");
      updateCart();
    })
    .catch((error) => {
      alert("Error submitting order, please try again.");
      console.error("Order error:", error);
    });
}

// Tab display functions
function showTab(tabId) {
  const contents = document.querySelectorAll(".tab-content");
  const tabs = document.querySelectorAll(".tab");

  // Hide all contents and remove active class from tabs
  contents.forEach((content) => (content.style.display = "none"));
  tabs.forEach((tab) => tab.classList.remove("active"));

  // Show selected content and mark tab as active
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

  // Show/hide no results message
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

  // Reattach sorted cards
  grid.innerHTML = "";
  sortedCards.forEach((card) => grid.appendChild(card));
}
