function highlightTab(tabId, colorClass) {
  const allTabs = ["veg-tab", "nonveg-tab", "drinks-tab", "desert-tab"];

  allTabs.forEach((id) => {
    const el = document.getElementById(id);
    el.classList.remove("active-tab", "green", "red", "blue", "purple");
  });

  const activeTab = document.getElementById(tabId);
  activeTab.classList.add("active-tab", colorClass);
}

function showVegItems() {
  hideAllTabs();
  document.getElementById("vegcontents").classList.add("active");
  highlightTab("veg-tab", "red");
}

function showNonVegItems() {
  hideAllTabs();
  document.getElementById("nonvegcontents").classList.add("active");
  highlightTab("nonveg-tab", "green");
}

function showdrinks() {
  hideAllTabs();
  document.getElementById("drinkcontents").classList.add("active");
  highlightTab("drinks-tab", "blue");
}

function showdesert() {
  hideAllTabs();
  document.getElementById("desertcontents").classList.add("active");
  highlightTab("desert-tab", "purple");
}

// Helper to hide all tabs before showing one
function hideAllTabs() {
  document.getElementById("vegcontents").classList.remove("active");
  document.getElementById("nonvegcontents").classList.remove("active");
  document.getElementById("drinkcontents").classList.remove("active");
  document.getElementById("desertcontents").classList.remove("active");
}

// Show veg by default on load
window.onload = function () {
  showVegItems();
};
function searchMenu() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const allSections = document.querySelectorAll(".tab-content");

  // Loop through all menu sections
  allSections.forEach((section) => {
    const cards = section.querySelectorAll(".menu-card");

    cards.forEach((card) => {
      const title = card.querySelector("h4").textContent.toLowerCase();

      // Match text with search
      if (title.includes(query)) {
        card.style.display = "block";
        card.classList.add("highlight");
      } else {
        card.style.display = "none";
        card.classList.remove("highlight");
      }
    });
  });

  // Removes highlight after 5 seconds
  setTimeout(() => {
    document.querySelectorAll(".menu-card.highlight").forEach((card) => {
      card.classList.remove("highlight");
    });
  }, 5000);
}

function addToCart(itemName, price) {
  alert(`${itemName} (Rs. ${price}) added to cart!`);
}
function filterMenu() {
  const filterValue = document.getElementById("filter").value;
  const activeSection = document.querySelector(".tab-content.active");

  if (!activeSection) return;

  const menuCards = Array.from(activeSection.querySelectorAll(".menu-card"));
  const menuGrid = activeSection.querySelector(".menu-grid");

  menuCards.sort((a, b) => {
    const priceA = parseInt(
      a.querySelector("p").textContent.replace("Rs. ", "")
    );
    const priceB = parseInt(
      b.querySelector("p").textContent.replace("Rs. ", "")
    );

    switch (filterValue) {
      case "price-asc":
        return priceA - priceB; // Low to High
      case "price-desc":
        return priceB - priceA; // High to Low
      case "default":
      default:
        return 0;
    }
  });

  menuGrid.innerHTML = "";
  menuCards.forEach((card) => {
    menuGrid.appendChild(card);
  });
}

let cart = [];

function addToCart(name, price) {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name, price, quantity: 1 });
  }

  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart-items");
  cartList.innerHTML = "";

  cart.forEach((item) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${item.name}</strong> - Rs. ${item.price} x ${item.quantity}
      <button onclick="updateQuantity('${item.name}', -1)">-</button>
      <button onclick="updateQuantity('${item.name}', 1)">+</button>
      <button onclick="removeItem('${item.name}')">Remove</button>
    `;

    cartList.appendChild(li);
  });

  updateTotal();
}

function updateQuantity(name, delta) {
  const item = cart.find((i) => i.name === name);
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter((i) => i.name !== name);
  }

  renderCart();
}

function removeItem(name) {
  cart = cart.filter((item) => item.name !== name);
  renderCart();
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  document.getElementById("cart-total").textContent = `Total: Rs. ${total}`;
}

function resetCart() {
  cart = [];
  renderCart();
}

//  final
function finalOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }
  const summaryList = document.getElementById("order-summary-list");
  const summaryTotal = document.getElementById("order-summary-total");
  summaryList.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} - Rs. ${item.price} x ${item.quantity}`;
    summaryList.appendChild(li);
    total += item.price * item.quantity;
  });
  summaryTotal.textContent = `Total: Rs. ${total}`;
  document.getElementById("order-modal").style.display = "flex";
}

function closeOrderModal() {
  document.getElementById("order-modal").style.display = "none";
}
