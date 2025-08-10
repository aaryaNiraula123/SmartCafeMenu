document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const loginOverlay = document.getElementById("login-overlay");
  const mainContent = document.getElementById("main-content");
  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-btn");
  const logoutConfirm = document.getElementById("logout-confirm");
  const logoutCancel = document.getElementById("logout-cancel");
  const logoutProceed = document.getElementById("logout-proceed");
  const loginError = document.getElementById("login-error");
  const tableFilter = document.getElementById("table-filter");
  const statusFilter = document.getElementById("status-filter");

  // Correct credentials
  const CORRECT_USERNAME = "bic cafe";
  const CORRECT_PASSWORD = "cafe";

  // Show login overlay by default
  loginOverlay.style.display = "flex";
  mainContent.style.display = "none";

  // Login functionality
  loginBtn.addEventListener("click", function () {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      loginOverlay.style.display = "none";
      mainContent.style.display = "block";
      initializeChart();
    } else {
      loginError.style.display = "block";
    }
  });

  // Logout functionality
  logoutBtn.addEventListener("click", function () {
    logoutConfirm.style.display = "flex";
  });

  logoutCancel.addEventListener("click", function () {
    logoutConfirm.style.display = "none";
  });

  logoutProceed.addEventListener("click", function () {
    logoutConfirm.style.display = "none";
    mainContent.style.display = "none";
    loginOverlay.style.display = "flex";
    // Clear password field on logout
    document.getElementById("password").value = "";
    loginError.style.display = "none";
  });

  // Filter functionality
  tableFilter.addEventListener("change", filterOrders);
  statusFilter.addEventListener("change", filterOrders);

  // Status change functionality
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", function () {
      const userName = this.getAttribute("data-user");
      const tableNumber = this.getAttribute("data-table");
      const newStatus = this.value;

      // In a real app, you would send this to the server
      console.log(`Status changed for ${userName} at Table ${tableNumber} to ${newStatus}`);

      // Update the UI
      const orderElement = document.querySelector(`.order[data-table="${tableNumber}"]`);
      if (orderElement) {
        orderElement.setAttribute("data-status", newStatus);
        const statusBadge = orderElement.querySelector(".order-status");
        statusBadge.className = `order-status ${newStatus}`;
        statusBadge.textContent =
          newStatus.charAt(0).toUpperCase() + newStatus.slice(1);

        // Reapply filters
        filterOrders();
      }
    });
  });

  // Delete order functionality
  document.querySelectorAll(".delete-all").forEach((button) => {
    button.addEventListener("click", function () {
      const userName = this.getAttribute("data-user");
      const tableNumber = this.getAttribute("data-table");

      if (
        confirm(`Are you sure you want to delete the entire order for ${userName} at Table ${tableNumber}?`)
      ) {
        // In a real app, you would send this to the server
        console.log(`Order deleted for ${userName} at Table ${tableNumber}`);

        // Remove from UI
        const orderElement = document.querySelector(`.order[data-table="${tableNumber}"]`);
        if (orderElement) {
          orderElement.remove();
        }

        // Show no orders message if no orders left
        if (document.querySelectorAll(".order").length === 0) {
          document.querySelector(".no-orders").style.display = "block";
        }
      }
    });
  });

  // Item action functionality
  document.querySelectorAll(".action-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.classList.contains("plus")
        ? "increase"
        : this.classList.contains("minus")
        ? "decrease"
        : "delete";
      const userName = this.getAttribute("data-user");
      const tableNumber = this.getAttribute("data-table");
      const itemName = this.getAttribute("data-item");

      // In a real app, you would send this to the server
      console.log(`Item action: ${action} for ${itemName} in order for ${userName} at Table ${tableNumber}`);

      // For demo purposes, we'll just show an alert
      alert(
        `Action: ${action}\nUser: ${userName}\nTable: ${tableNumber}\nItem: ${itemName}`
      );
    });
  });

  // Filter orders function
  function filterOrders() {
    const tableValue = tableFilter.value;
    const statusValue = statusFilter.value;

    document.querySelectorAll(".order").forEach((order) => {
      const orderTable = order.getAttribute("data-table");
      const orderStatus = order.getAttribute("data-status");

      const tableMatch = tableValue === "all" || orderTable === tableValue;
      const statusMatch = statusValue === "all" || orderStatus === statusValue;

      if (tableMatch && statusMatch) {
        order.style.display = "block";
      } else {
        order.style.display = "none";
      }
    });
  }

  // Initialize chart
  function initializeChart() {
    const ctx = document.getElementById("ordersChart").getContext("2d");

    // Sample data - in a real app, this would come from your backend
    const chartData = {
      labels: ["Pending", "Preparing", "Ready", "Delivered"],
      datasets: [
        {
          label: "Orders by Status",
          data: [12, 19, 3, 5],
          backgroundColor: [
            "rgba(255, 152, 0, 0.7)",
            "rgba(33, 150, 243, 0.7)",
            "rgba(76, 175, 80, 0.7)",
            "rgba(158, 158, 158, 0.7)",
          ],
          borderColor: [
            "rgba(255, 152, 0, 1)",
            "rgba(33, 150, 243, 1)",
            "rgba(76, 175, 80, 1)",
            "rgba(158, 158, 158, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  // Allow pressing Enter to login
  document
    .getElementById("password")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        loginBtn.click();
      }
    });
});
