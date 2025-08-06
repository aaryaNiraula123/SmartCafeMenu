document.addEventListener("DOMContentLoaded", function () {
  // Initialize notification system
  initializeNotificationSystem();

  // Filter orders based on table and status
  const tableFilter = document.getElementById("table-filter");
  const statusFilter = document.getElementById("status-filter");

  function applyFilters() {
    const tableValue = tableFilter.value;
    const statusValue = statusFilter.value;

    document.querySelectorAll(".order").forEach((order) => {
      const tableMatch =
        tableValue === "all" || order.dataset.table === tableValue;
      const statusMatch =
        statusValue === "all" || order.dataset.status === statusValue;

      order.style.display = tableMatch && statusMatch ? "block" : "none";
    });
  }

  tableFilter.addEventListener("change", applyFilters);
  statusFilter.addEventListener("change", applyFilters);

  // Handle status changes
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", function () {
      const userName = this.dataset.user;
      const tableNumber = this.dataset.table;
      const newStatus = this.value;

      updateOrderStatus(userName, tableNumber, newStatus);
    });
  });

  // Delete order buttons
  document.querySelectorAll(".delete-all").forEach((button) => {
    button.addEventListener("click", function () {
      const userName = this.dataset.user;
      const tableNumber = this.dataset.table;

      showConfirmDialog(
        `Delete Order from Table ${tableNumber}?`,
        `Are you sure you want to delete this entire order?`,
        () => deleteOrder(userName, tableNumber)
      );
    });
  });

  // Item quantity controls
  document.querySelectorAll(".plus").forEach((button) => {
    button.addEventListener("click", function () {
      updateItemQuantity(
        this.dataset.user,
        this.dataset.table,
        this.dataset.item,
        "add"
      );
    });
  });

  document.querySelectorAll(".minus").forEach((button) => {
    button.addEventListener("click", function () {
      updateItemQuantity(
        this.dataset.user,
        this.dataset.table,
        this.dataset.item,
        "remove"
      );
    });
  });

  // Delete item buttons
  document.querySelectorAll(".delete-item").forEach((button) => {
    button.addEventListener("click", function () {
      showConfirmDialog(
        "Remove Item",
        "Are you sure you want to remove this item from the order?",
        () =>
          deleteItem(this.dataset.user, this.dataset.table, this.dataset.item)
      );
    });
  });

  // API functions
  async function updateOrderStatus(userName, tableNumber, newStatus) {
    try {
      showNotification("info", "Updating...", "Changing order status", 2000);

      const response = await fetch(`/update_status/${tableNumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update the UI to reflect the new status
        const orderElement = document.querySelector(
          `.order[data-table="${tableNumber}"]`
        );
        if (orderElement) {
          orderElement.dataset.status = newStatus;
          orderElement.querySelector(".order-status").textContent =
            newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
          orderElement.querySelector(
            ".order-status"
          ).className = `order-status ${newStatus}`;

          // Re-apply filters in case the status change affects visibility
          applyFilters();

          showNotification(
            "success",
            "Status Updated",
            `Order status changed to ${newStatus}`,
            3000
          );
        }
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showNotification("error", "Update Failed", error.message, 4000);
    }
  }

  async function deleteOrder(userName, tableNumber) {
    try {
      showNotification("info", "Processing...", "Deleting order", 2000);

      const response = await fetch(`/delete_order/${tableNumber}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Remove the order from the UI
        const orderElement = document.querySelector(
          `.order[data-table="${tableNumber}"]`
        );
        if (orderElement) {
          orderElement.remove();
        }
        showNotification(
          "success",
          "Order Deleted",
          "The order was successfully removed",
          3000
        );
      } else {
        throw new Error(data.error || "Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      showNotification("error", "Deletion Failed", error.message, 4000);
    }
  }

  async function updateItemQuantity(userName, tableNumber, itemName, action) {
    try {
      showNotification("info", "Updating...", "Modifying item quantity", 2000);

      const response = await fetch("/update_item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
          table_number: tableNumber,
          item_name: itemName,
          action: action,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        throw new Error(data.error || "Failed to update item quantity");
      }
    } catch (error) {
      console.error("Error updating item quantity:", error);
      showNotification("error", "Update Failed", error.message, 4000);
    }
  }

  async function deleteItem(userName, tableNumber, itemName) {
    try {
      showNotification(
        "info",
        "Processing...",
        "Removing item from order",
        2000
      );

      const response = await fetch("/delete_item", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_name: userName,
          table_number: tableNumber,
          item_name: itemName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Reload the page to reflect changes
        window.location.reload();
      } else {
        throw new Error(data.error || "Failed to delete item");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      showNotification("error", "Removal Failed", error.message, 4000);
    }
  }

  // Notification System
  function initializeNotificationSystem() {
    const notificationContainer = document.createElement("div");
    notificationContainer.className = "notification-container";
    document.body.appendChild(notificationContainer);
  }

  function showNotification(type, title, message, duration = 5000) {
    const container = document.querySelector(".notification-container");
    const notification = document.createElement("div");
    const icon =
      {
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ⓘ",
      }[type] || "";

    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <div class="notification-close">&times;</div>
      <div class="notification-progress"></div>
    `;

    container.appendChild(notification);

    // Trigger the show animation
    setTimeout(() => notification.classList.add("show"), 10);

    // Close button functionality
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        closeNotification(notification);
      });

    // Auto-close after duration
    if (duration) {
      setTimeout(() => closeNotification(notification), duration);
    }
  }

  function closeNotification(notification) {
    notification.classList.remove("show");
    notification.classList.add("hide");
    notification.addEventListener("transitionend", () => notification.remove());
  }

  function showConfirmDialog(title, message, confirmCallback) {
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";
    dialog.innerHTML = `
      <div class="dialog-content">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="dialog-buttons">
          <button class="cancel-btn">Cancel</button>
          <button class="confirm-btn">Confirm</button>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);
    dialog.style.display = "flex";

    dialog.querySelector(".cancel-btn").addEventListener("click", () => {
      dialog.remove();
    });

    dialog.querySelector(".confirm-btn").addEventListener("click", () => {
      dialog.remove();
      confirmCallback();
    });
  }
});
