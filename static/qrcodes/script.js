// document.addEventListener("DOMContentLoaded", () => {
//   const searchInput = document.getElementById("searchInput");
//   const categoryButtons = document.getElementById("categoryButtons");
//   const menuItems = document.querySelectorAll("#menuItems .menu-item");
//   const cartCount = document.getElementById("cartCount");

//   let activeCategory = "veg";
//   let cart = [];
//   let cartItems = 0;

//   function hideAllTabs() {
//     document.getElementById("vegcontents").classList.remove("active");
//     document.getElementById("nonvegcontents").classList.remove("active");
//     document.getElementById("drinkcontents").classList.remove("active");
//     document.getElementById("desertcontents").classList.remove("active");
//   }

//   function showVegItems() {
//     hideAllTabs();
//     document.getElementById("vegcontents").classList.add("active");
//   }

//   function showNonVegItems() {
//     hideAllTabs();
//     document.getElementById("nonvegcontents").classList.add("active");
//   }

//   function showdrinks() {
//     hideAllTabs();
//     document.getElementById("drinkcontents").classList.add("active");
//   }

//   function showdesert() {
//     hideAllTabs();
//     document.getElementById("desertcontents").classList.add("active");
//   }

//   function addToCart(itemName, price) {
//     cart.push({ name: itemName, price: price });
//     cartItems++;
//     cartCount.textContent = cartItems;
//     renderCart();
//   }

//   function renderCart() {
//     const cartItemsContainer = document.getElementById("cart-items");
//     const cartTotalContainer = document.getElementById("cart-total");
//     cartItemsContainer.innerHTML = "";
//     let total = 0;
//     cart.forEach((item) => {
//       const li = document.createElement("li");
//       li.textContent = `${item.name} - Rs. ${item.price}`;
//       cartItemsContainer.appendChild(li);
//       total += item.price;
//     });
//     cartTotalContainer.textContent = `Total: Rs. ${total}`;
//   }

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

//     // Apply sort if applicable
//     const filter = document.getElementById("filter")?.value;
//     const activeSection = document.querySelector(".tab-content.active");
//     if (!activeSection) return;
//     const cards = Array.from(activeSection.querySelectorAll(".menu-card"));
//     const getPrice = (card) => {
//       const priceText = card.querySelector("p").textContent;
//       return parseInt(priceText.replace(/\D/g, ""));
//     };
//     cards.sort((a, b) => {
//       const priceA = getPrice(a);
//       const priceB = getPrice(b);
//       if (filter === "price-asc") return priceA - priceB;
//       if (filter === "price-desc") return priceB - priceA;
//       return 0;
//     });
//     const grid = activeSection.querySelector(".menu-grid");
//     cards.forEach((card) => grid.appendChild(card));
//   }

//   function searchMenu() {
//     const query = searchInput.value.toLowerCase();
//     const allSections = document.querySelectorAll(".tab-content");
//     allSections.forEach((section) => {
//       const cards = section.querySelectorAll(".menu-card");
//       cards.forEach((card) => {
//         const title = card.querySelector("h4").textContent.toLowerCase();
//         const matches = title.includes(query);
//         card.style.display = matches ? "block" : "none";
//         card.classList.toggle("highlight", matches);
//       });
//     });
//     setTimeout(() => {
//       document.querySelectorAll(".menu-card.highlight").forEach((card) => {
//         card.classList.remove("highlight");
//       });
//     }, 5000);
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

//   menuItems.forEach((item) => {
//     const button = item.querySelector("button");
//     button.addEventListener("click", () => {
//       const name = item.dataset.name;
//       const price = parseInt(
//         item.querySelector(".price").textContent.replace(/\D/g, "")
//       );
//       addToCart(name, price);
//       button.textContent = "Added ✓";
//       button.disabled = true;
//       button.style.backgroundColor = "#4a2c2c";
//     });
//   });

//   window.onload = showVegItems;
//   window.searchMenu = searchMenu;
//   window.filterMenu = filterMenu;
//   window.showVegItems = showVegItems;
//   window.showNonVegItems = showNonVegItems;
//   window.showdrinks = showdrinks;
//   window.showdesert = showdesert;
//   window.addToCart = addToCart;
// });
