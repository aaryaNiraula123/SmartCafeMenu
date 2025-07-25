// // script.js

// document.addEventListener("DOMContentLoaded", () => {
//   const searchInput = document.getElementById("searchInput");
//   const categoryButtons = document.getElementById("categoryButtons");
//   const menuItems = document.querySelectorAll("#menuItems .menu-item");
//   const cartCount = document.getElementById("cartCount");
//   const cartTotal = document.getElementById("cartTotal");
//   const cartItems = document.getElementById("cartItems");

//   let activeCategory = "all";
//   let cart = {};

//   function filterMenu() {
//     const searchText = searchInput.value.toLowerCase();

//     menuItems.forEach((item) => {
//       const name = item.dataset.name.toLowerCase();
//       const category = item.dataset.category;
//       const matchesCategory =
//         activeCategory === "all" || category === activeCategory;
//       const matchesSearch = name.includes(searchText);

//       item.style.display = matchesCategory && matchesSearch ? "flex" : "none";
//     });
//   }

//   categoryButtons.addEventListener("click", (e) => {
//     if (e.target.tagName !== "BUTTON") return;
//     activeCategory = e.target.dataset.category;
//     categoryButtons.querySelectorAll("button").forEach((btn) => {
//       btn.classList.toggle("active", btn === e.target);
//     });
//     filterMenu();
//   });

//   searchInput.addEventListener("input", filterMenu);

//   function updateCartDisplay() {
//     const totalItems = Object.values(cart).reduce(
//       (sum, item) => sum + item.quantity,
//       0
//     );
//     const totalPrice = Object.values(cart).reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );

//     cartCount.textContent = totalItems;
//     cartTotal.textContent = `Rs. ${totalPrice}`;

//     cartItems.innerHTML = "";
//     Object.entries(cart).forEach(([name, item]) => {
//       const cartItem = document.createElement("div");
//       cartItem.classList.add("cart-item");
//       cartItem.innerHTML = `
//         <span>${name} x ${item.quantity}</span>
//         <button onclick="removeFromCart('${name}')">&minus;</button>
//       `;
//       cartItems.appendChild(cartItem);
//     });
//   }

//   window.addToCart = function (name, price, button) {
//     if (!cart[name]) {
//       cart[name] = { quantity: 1, price };
//     } else {
//       cart[name].quantity += 1;
//     }

//     updateCartDisplay();

//     button.disabled = true;
//     button.textContent = "Added";
//     setTimeout(() => {
//       button.disabled = false;
//       button.textContent = "Add to Cart";
//     }, 1000);
//   };

//   window.removeFromCart = function (name) {
//     if (cart[name]) {
//       cart[name].quantity -= 1;
//       if (cart[name].quantity <= 0) {
//         delete cart[name];
//       }
//       updateCartDisplay();
//     }
//   };

//   filterMenu();
// });
