// Enhanced cart & UI logic with animations
let cart = JSON.parse(localStorage.getItem("smartCafeCart") || "[]");

// Format currency with better display
function formatCurrency(n) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

// Save cart to localStorage and render
function saveCart() {
  localStorage.setItem("smartCafeCart", JSON.stringify(cart));
  renderCart();
  updateCartBadge();
}

// Add item to cart with animation
function addToCart(name, price) {
  const existing = cart.find((i) => i.name === name);
  if (existing) {
    existing.quantity++;
    animateCartItem(existing.name, "inc");
  } else {
    cart.push({ name, price, quantity: 1 });
    animateCartItem(name, "add");
  }
  saveCart();

  // Show quick confirmation with animation
  showCartAnimation(`${name} added to cart!`);
}

// Enhanced animation for cart items
function animateCartItem(name, action) {
  const itemElement = Array.from(document.querySelectorAll(".menu-card h4"))
    .find((el) => el.textContent === name)
    ?.closest(".menu-card");

  if (itemElement && action === "add") {
    itemElement.style.animation = "pulse 0.6s ease-in-out";
    itemElement.style.transform = "scale(1.05)";
    itemElement.style.boxShadow = "0 0 20px rgba(111, 143, 114, 0.6)";

    setTimeout(() => {
      itemElement.style.animation = "";
      itemElement.style.transform = "";
      itemElement.style.boxShadow = "";
    }, 600);
  }
}

// Small cart notification animation (consistent style)
function showCartAnimation(message) {
  showQuickToast(message);
}

// Show quick toast notification (enhanced but compact)
function showQuickToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-notification ${type}`;
  toast.textContent = message;

  const bgColor =
    type === "error" ? "rgba(220, 38, 38, 0.95)" : "rgba(111, 143, 114, 0.95)";
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 50%;
    background: ${bgColor};
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    font-size: 13px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    transform: translateX(-50%) translateY(60px);
    opacity: 0;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    max-width: 280px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(0)";
    toast.style.opacity = "1";
  }, 10);

  setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(60px)";
    toast.style.opacity = "0";
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 1800);
}

// Render cart items with animations
function renderCart() {
  const ul = document.getElementById("cart-items");
  const totalEl = document.getElementById("cart-total");
  ul.innerHTML = "";

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-name">${item.name}</span>
      <div class="item-controls">
        <span class="item-price">${formatCurrency(item.price)}</span>
        <span class="qty">x${item.quantity}</span>
        <button class="qty-btn dec" onclick="dec('${item.name}')">−</button>
        <button class="qty-btn inc" onclick="inc('${item.name}')">+</button>
      </div>
    `;

    // Add stagger animation for cart items
    li.style.opacity = "0";
    li.style.transform = "translateY(20px)";
    li.style.transition = "all 0.3s ease";

    ul.appendChild(li);

    setTimeout(() => {
      li.style.opacity = "1";
      li.style.transform = "translateY(0)";
    }, index * 50);
  });

  totalEl.textContent = `Total: ${formatCurrency(total)}`;
  totalEl.style.animation = "fadeIn 0.5s ease";

  const finalOrderBtn = document.getElementById("final-order-btn");
  finalOrderBtn.disabled = cart.length === 0;

  if (cart.length > 0) {
    finalOrderBtn.style.animation = "pulse 0.6s ease-in-out";
  }
}

// Update cart badge with animation
function updateCartBadge() {
  const badge = document.querySelector(".cart-badge");
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (!badge && itemCount > 0) {
    const newBadge = document.createElement("span");
    newBadge.className = "cart-badge";
    newBadge.textContent = itemCount;
    newBadge.style.cssText = `
      background: linear-gradient(45deg, rgb(111, 143, 114), rgba(111, 143, 114, 0.8));
      color: white;
      border-radius: 50%;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: bold;
      margin-left: 8px;
      display: inline-block;
      min-width: 20px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(111, 143, 114, 0.4);
      animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    `;
    document.querySelector(".cart-section h3").appendChild(newBadge);
  } else if (badge) {
    if (itemCount > 0) {
      badge.textContent = itemCount;
      badge.style.display = "inline-block";
      badge.style.animation = "pulse 0.4s ease";
    } else {
      badge.style.animation = "bounceOut 0.3s ease";
      setTimeout(() => {
        badge.style.display = "none";
      }, 300);
    }
  }
}

// Increase quantity with animation
function inc(name) {
  const item = cart.find((i) => i.name === name);
  if (item) {
    item.quantity++;
    animateCartChange(name, "inc");
    saveCart();
  }
}

// Decrease quantity with animation
function dec(name) {
  const idx = cart.findIndex((i) => i.name === name);
  if (idx > -1) {
    if (cart[idx].quantity > 1) {
      cart[idx].quantity--;
      animateCartChange(name, "dec");
    } else {
      animateCartChange(name, "remove");
      cart.splice(idx, 1);
    }
    saveCart();
  }
}

// Enhanced animate cart quantity changes
function animateCartChange(name, action) {
  const itemElement = Array.from(
    document.querySelectorAll("#cart-items li")
  ).find((li) => li.querySelector(".item-name").textContent === name);

  if (itemElement) {
    const qtyElement = itemElement.querySelector(".qty");
    const btn = itemElement.querySelector(`.${action}`);

    if (action === "remove") {
      itemElement.style.animation = "slideOutRight 0.4s ease";
      itemElement.style.transform = "translateX(100%)";
      itemElement.style.opacity = "0";
      setTimeout(() => {
        if (itemElement.parentNode) {
          itemElement.remove();
        }
      }, 400);
    } else {
      if (btn) {
        btn.style.transform = "scale(1.3)";
        btn.style.background = "rgba(111, 143, 114, 0.2)";
        btn.style.borderColor = "rgb(111, 143, 114)";
        setTimeout(() => {
          btn.style.transform = "";
          btn.style.background = "";
          btn.style.borderColor = "";
        }, 200);
      }

      if (qtyElement) {
        qtyElement.style.animation = "bounce 0.5s ease";
        qtyElement.style.color = "rgb(111, 143, 114)";
        qtyElement.style.fontWeight = "bold";
        setTimeout(() => {
          qtyElement.style.animation = "";
          qtyElement.style.color = "";
          qtyElement.style.fontWeight = "";
        }, 500);
      }
    }
  }
}

// Enhanced reset cart with confirmation and animation
function resetCart() {
  if (cart.length === 0) {
    showQuickToast("Your cart is already empty!", "error");
    return;
  }

  const clearModal = document.getElementById("clear-cart-modal");
  clearModal.style.display = "flex";
  clearModal.style.animation = "modalFadeIn 0.3s ease";

  document.getElementById("confirm-clear").onclick = function () {
    cart = [];
    saveCart();
    clearModal.style.animation = "modalFadeOut 0.3s ease";
    setTimeout(() => {
      clearModal.style.display = "none";
    }, 300);
    showQuickToast("Cart cleared successfully!");
  };

  document.getElementById("cancel-clear").onclick = function () {
    clearModal.style.animation = "modalFadeOut 0.3s ease";
    setTimeout(() => {
      clearModal.style.display = "none";
    }, 300);
  };

  document.querySelector("#clear-cart-modal .close-modal").onclick =
    function () {
      clearModal.style.animation = "modalFadeOut 0.3s ease";
      setTimeout(() => {
        clearModal.style.display = "none";
      }, 300);
    };
}

// Order modal handlers with animations
const orderModal = document.getElementById("order-modal");
const modalClose = document.querySelectorAll(".close-modal");
const openModalBtn = document.getElementById("final-order-btn");
const cancelOrderBtn = document.getElementById("cancel-order");
const confirmOrderBtn = document.getElementById("confirm-order");

function openOrderModal() {
  if (cart.length === 0) {
    showQuickToast("Your cart is empty!", "error");
    return;
  }

  const list = document.getElementById("order-items-list");
  list.innerHTML = "";

  let total = 0;
  cart.forEach((i, index) => {
    const li = document.createElement("li");
    li.textContent = `${i.name} x${i.quantity} — ${formatCurrency(
      i.price * i.quantity
    )}`;

    // Add stagger animation for order items
    li.style.opacity = "0";
    li.style.transform = "translateX(-20px)";
    li.style.transition = "all 0.3s ease";

    list.appendChild(li);
    total += i.price * i.quantity;

    setTimeout(() => {
      li.style.opacity = "1";
      li.style.transform = "translateX(0)";
    }, index * 100);
  });

  document.getElementById("modal-total-amount").textContent =
    formatCurrency(total);
  orderModal.style.display = "flex";
  orderModal.style.animation =
    "modalFadeIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)";

  // Reset form
  document.getElementById("customer-name").value = "";
  document.getElementById("table-number").selectedIndex = 0;
}

function closeOrderModal() {
  orderModal.style.animation = "modalFadeOut 0.3s ease";
  setTimeout(() => {
    orderModal.style.display = "none";
  }, 300);
}

modalClose.forEach((btn) => btn.addEventListener("click", closeOrderModal));
cancelOrderBtn.addEventListener("click", closeOrderModal);

// Enhanced place order with loading animation
confirmOrderBtn.addEventListener("click", async () => {
  const name = document.getElementById("customer-name").value.trim();
  const table = document.getElementById("table-number").value;

  if (!name || !table) {
    showQuickToast("Please enter name and table number", "error");
    return;
  }

  const payload = {
    user_name: name,
    table_number: parseInt(table),
    total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    items: cart.map((i) => ({
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    })),
  };

  try {
    confirmOrderBtn.disabled = true;
    confirmOrderBtn.innerHTML = '<div class="spinner"></div> Processing...';
    confirmOrderBtn.style.background = "rgba(111, 143, 114, 0.7)";

    const res = await fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      // Calculate total before clearing cart
      const orderTotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      // Clear cart & show success
      cart = [];
      saveCart();
      closeOrderModal();

      document.getElementById("success-message").innerHTML = `
        <p>Thank you for your order, ${name}!</p>
        <p>Order ID: <strong>${data.order_id || "Generated"}</strong></p>
        <p>Table: <strong>${data.table_number || table}</strong></p>
        <p>Total: <strong>${formatCurrency(
          data.total || orderTotal
        )}</strong></p>
      `;

      const successModal = document.getElementById("success-modal");
      successModal.style.display = "flex";
      successModal.style.animation =
        "modalFadeIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
    } else {
      throw new Error(data.error || "Failed to place order");
    }
  } catch (err) {
    showQuickToast(err.message, "error");
  } finally {
    confirmOrderBtn.disabled = false;
    confirmOrderBtn.textContent = "Place Order";
    confirmOrderBtn.style.background = "";
  }
});

// Close success modal with animation
document.getElementById("success-ok").addEventListener("click", () => {
  const successModal = document.getElementById("success-modal");
  successModal.style.animation = "modalFadeOut 0.3s ease";
  setTimeout(() => {
    successModal.style.display = "none";
  }, 300);
});

// Enhanced search functionality with animation
function searchMenu() {
  const q = document.getElementById("searchInput").value.toLowerCase().trim();
  const cards = document.querySelectorAll(".menu-card");
  let visibleCount = 0;

  cards.forEach((card, index) => {
    const text = card.querySelector("h4").textContent.toLowerCase();
    const desc = card.querySelector("p")?.textContent.toLowerCase() || "";

    if (text.includes(q) || desc.includes(q)) {
      card.style.display = "";
      card.style.animation = `fadeInUp 0.4s ease ${index * 0.05}s both`;
      visibleCount++;
    } else {
      card.style.animation = "fadeOut 0.3s ease";
      setTimeout(() => {
        card.style.display = "none";
      }, 300);
    }
  });

  // Show message if no results
  if (visibleCount === 0 && q) {
    showQuickToast("No items found matching your search", "error");
  }
}

// Enhanced filter menu with animation
function filterMenu() {
  const sel = document.getElementById("filter").value;
  const container = document.querySelector(".tab-content[style*='block']");

  if (!container) return;

  const cards = Array.from(container.querySelectorAll(".menu-card"));

  if (sel === "price-asc" || sel === "price-desc") {
    cards.sort((a, b) => {
      const pa = parseInt(a.querySelector("p").textContent.replace(/\D/g, ""));
      const pb = parseInt(b.querySelector("p").textContent.replace(/\D/g, ""));
      return sel === "price-asc" ? pa - pb : pb - pa;
    });

    const grid = container.querySelector(".menu-grid");
    grid.innerHTML = "";
    cards.forEach((card, index) => {
      card.style.animation = `slideInUp 0.4s ease ${index * 0.05}s both`;
      grid.appendChild(card);
    });
  }
}

// Enhanced tab switching with animations
function showTab(id) {
  // Update active tab with animation
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
    tab.style.transform = "scale(1)";
  });

  const activeTab = document.querySelector(`.tab[onclick*="${id}"]`);
  if (activeTab) {
    activeTab.classList.add("active");
    activeTab.style.transform = "scale(1.05)";
    activeTab.style.background = "rgba(111, 143, 114, 0.1)";
    activeTab.style.color = "rgb(111, 143, 114)";
    activeTab.style.transition = "all 0.3s ease";
  }

  // Hide current content with animation
  document.querySelectorAll(".tab-content").forEach((content) => {
    if (content.style.display === "block") {
      content.style.animation = "fadeOut 0.2s ease";
      setTimeout(() => {
        content.style.display = "none";
      }, 200);
    } else {
      content.style.display = "none";
    }
  });

  // Show new content with animation
  setTimeout(() => {
    const content = document.getElementById(id);
    if (content) {
      content.style.display = "block";
      content.style.animation = "fadeInUp 0.4s ease";

      // Animate menu cards
      const cards = content.querySelectorAll(".menu-card");
      cards.forEach((card, index) => {
        card.style.animation = `slideInUp 0.4s ease ${index * 0.05}s both`;
      });
    }
  }, 200);
}

// Initialize with enhanced animations
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  showTab("vegcontents");

  // Add enhanced event listeners for search input
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") searchMenu();
  });

  // Add focus animations to search input
  searchInput.addEventListener("focus", () => {
    searchInput.style.borderColor = "rgb(111, 143, 114)";
    searchInput.style.boxShadow = "0 0 0 3px rgba(111, 143, 114, 0.1)";
    searchInput.style.transform = "scale(1.02)";
  });

  searchInput.addEventListener("blur", () => {
    searchInput.style.borderColor = "";
    searchInput.style.boxShadow = "";
    searchInput.style.transform = "";
  });

  // Initialize tabs with enhanced click animations
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach((t) => {
        t.classList.remove("active");
        t.style.transform = "";
        t.style.background = "";
        t.style.color = "";
      });
      this.classList.add("active");
    });

    // Add hover effects
    tab.addEventListener("mouseenter", () => {
      if (!tab.classList.contains("active")) {
        tab.style.background = "rgba(111, 143, 114, 0.05)";
        tab.style.transform = "translateY(-2px)";
      }
    });

    tab.addEventListener("mouseleave", () => {
      if (!tab.classList.contains("active")) {
        tab.style.background = "";
        tab.style.transform = "";
      }
    });
  });

  // Enhanced modal click outside handling
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.animation = "modalFadeOut 0.3s ease";
        setTimeout(() => {
          modal.style.display = "none";
        }, 300);
      }
    });
  });

  // Add enhanced button animations
  document.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("mousedown", () => {
      btn.style.transform = "scale(0.95)";
    });

    btn.addEventListener("mouseup", () => {
      btn.style.transform = "";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "";
    });
  });
});

// Tab functions
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

// Add CSS animations dynamically
const style = document.createElement("style");
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }

  @keyframes bounceIn {
    0% { transform: scale(0); opacity: 0; }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes bounceOut {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(0); opacity: 0; }
  }

  @keyframes fadeIn {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }

  @keyframes fadeOut {
    0% { opacity: 1; }
    100% { opacity: 0; }
  }

  @keyframes slideOutRight {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }

  @keyframes fadeInUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideInUp {
    0% { opacity: 0; transform: translateY(50px) scale(0.9); }
    100% { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes modalFadeIn {
    0% { opacity: 0; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }

  @keyframes modalFadeOut {
    0% { opacity: 1; transform: scale(1); }
    100% { opacity: 0; transform: scale(0.8); }
  }

  @keyframes bounce {
    0%, 20%, 60%, 100% { transform: translateY(0); }
    40% { transform: translateY(-10px); }
    80% { transform: translateY(-5px); }
  }

  .spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .menu-card:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 0 10px 25px rgba(111, 143, 114, 0.2);
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .qty-btn:hover {
    background: rgba(111, 143, 114, 0.1) !important;
    border-color: rgb(111, 143, 114) !important;
    color: rgb(111, 143, 114) !important;
    transform: scale(1.1);
  }

  .tab:hover {
    transition: all 0.3s ease;
  }
`;
document.head.appendChild(style);
