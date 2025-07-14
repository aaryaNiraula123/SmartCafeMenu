document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchInput");
  const categoryButtons = document.getElementById("categoryButtons");
  const menuItems = document.querySelectorAll("#menuItems .menu-item");
  const cartCount = document.getElementById("cartCount");

  let activeCategory = "veg";
  let cartItems = 0;

  // Filter menu items by category and search text
  function filterMenu() {
    const searchText = searchInput.value.toLowerCase();

    menuItems.forEach((item) => {
      const name = item.dataset.name.toLowerCase();
      const category = item.dataset.category;

      const matchesCategory =
        activeCategory === "all" || category === activeCategory;
      const matchesSearch = name.includes(searchText);

      if (matchesCategory && matchesSearch) {
        item.style.display = "flex";
      } else {
        item.style.display = "none";
      }
    });
  }

  // Handle category button clicks
  categoryButtons.addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;

    activeCategory = e.target.dataset.category;

    // Update active button styling
    categoryButtons.querySelectorAll("button").forEach((btn) => {
      btn.classList.toggle("active", btn === e.target);
    });

    filterMenu();
  });

  // Handle search input
  searchInput.addEventListener("input", filterMenu);

  // Handle add to cart buttons
  menuItems.forEach((item) => {
    const button = item.querySelector("button");
    button.addEventListener("click", () => {
      cartItems++;
      cartCount.textContent = cartItems;
      button.textContent = "Added ✓";
      button.disabled = true;
      button.style.backgroundColor = "#4a2c2c";
    });
  });

  // Initial filter
  filterMenu();
});
