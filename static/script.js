let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  // Load saved cart from localStorage
  const storedCart = localStorage.getItem("cart");
  if (storedCart) {
    cart = JSON.parse(storedCart);
    updateCart();
  }
  showVegItems(); // default tab
});

function addToCart(itemName, itemPrice) {
  const existingItem = cart.find((item) => item.name === itemName);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ name: itemName, price: itemPrice, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const cartItemsElement = document.getElementById("cart-items");
  const cartTotalElement = document.getElementById("cart-total");
  cartItemsElement.innerHTML = "";
  let total = 0;

  cart.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `${item.name} x${item.quantity} - Rs. ${
      item.price * item.quantity
    }`;
    cartItemsElement.appendChild(li);
    total += item.price * item.quantity;
  });

  cartTotalElement.textContent = `Total: Rs. ${total}`;
}

function resetCart() {
  cart = [];
  localStorage.removeItem("cart");
  updateCart();
  alert("Cart has been reset!");
}

function finalOrder() {
  if (cart.length === 0) {
    alert("Your cart is empty!");
    return;
  }

  const userName = prompt("Please enter your name for the order:");
  if (!userName || userName.trim() === "") {
    alert("Name is required to place order!");
    return;
  }

  // Prepare data
  const orderData = {
    user_name: userName.trim(),
    items: cart,
  };

  fetch("/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message || "Thank you for your order!");
      // Clear cart after successful order
      cart = [];
      localStorage.removeItem("cart");
      updateCart();

      // Redirect or reload menu page
      window.location.href = "/menu/1";
    })
    .catch((error) => {
      alert("Error submitting order, please try again.");
      console.error("Order error:", error);
    });
}

// Tab display
function showTab(tabId) {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((content) => (content.style.display = "none"));

  const active = document.getElementById(tabId);
  if (active) active.style.display = "block";
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

  menuCards.forEach((card) => {
    const itemName = card.querySelector("h4").textContent.toLowerCase();
    card.style.display = itemName.includes(input) ? "block" : "none";
  });
}

// Sort menu items
function filterMenu() {
  const value = document.getElementById("filter").value;
  const allContents = document.querySelectorAll(".tab-content");

  allContents.forEach((content) => {
    const cards = Array.from(content.querySelectorAll(".menu-card"));

    let sortedCards = cards;
    if (value === "price-asc") {
      sortedCards = cards.sort((a, b) => {
        const priceA = parseInt(
          a.querySelector("p").textContent.replace("Rs. ", "")
        );
        const priceB = parseInt(
          b.querySelector("p").textContent.replace("Rs. ", "")
        );
        return priceA - priceB;
      });
    } else if (value === "price-desc") {
      sortedCards = cards.sort((a, b) => {
        const priceA = parseInt(
          a.querySelector("p").textContent.replace("Rs. ", "")
        );
        const priceB = parseInt(
          b.querySelector("p").textContent.replace("Rs. ", "")
        );
        return priceB - priceA;
      });
    }

    const grid = content.querySelector(".menu-grid");
    if (grid) {
      grid.innerHTML = "";
      sortedCards.forEach((card) => grid.appendChild(card));
    }
  });
}
