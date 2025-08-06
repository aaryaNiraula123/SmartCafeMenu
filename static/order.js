document.addEventListener("DOMContentLoaded", function () {
  // Filter functionality
  const tableFilter = document.getElementById("table-filter");
  const statusFilter = document.getElementById("status-filter");

  function applyFilters() {
    const selectedTable = tableFilter.value;
    const selectedStatus = statusFilter.value;

    document.querySelectorAll(".order").forEach((order) => {
      const table = order.dataset.table;
      const status = order.dataset.status;

      const tableMatch = selectedTable === "all" || table === selectedTable;
      const statusMatch = selectedStatus === "all" || status === selectedStatus;

      if (tableMatch && statusMatch) {
        order.style.display = "block";
        // Add animation when showing
        order.style.animation = "fadeIn 0.5s ease";
      } else {
        order.style.display = "none";
      }
    });
  }

  tableFilter.addEventListener("change", applyFilters);
  statusFilter.addEventListener("change", applyFilters);

  // Status change functionality
  document.querySelectorAll(".status-select").forEach((select) => {
    select.addEventListener("change", function () {
      const userName = this.dataset.user;
      const tableNumber = this.dataset.table;
      const newStatus = this.value;
      const oldStatus = this.closest(".order").dataset.status;

      // Update the status visually immediately
      const orderElement = this.closest(".order");
      orderElement.dataset.status = newStatus;

      // Update the status badge
      const statusBadge = orderElement.querySelector(".order-status");
      statusBadge.textContent =
        newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      statusBadge.className = "order-status " + newStatus;

      // Show notification
      showNotification(
        `Order status changed from ${oldStatus} to ${newStatus}`
      );

      // Here you would typically send an AJAX request to update the status on the server
      // For example:
      /*
            fetch('/update-order-status', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_name: userName,
                    table_number: tableNumber,
                    status: newStatus
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    // Revert if there was an error
                    this.value = oldStatus;
                    orderElement.dataset.status = oldStatus;
                    statusBadge.textContent = oldStatus.charAt(0).toUpperCase() + oldStatus.slice(1);
                    statusBadge.className = 'order-status ' + oldStatus;
                    showNotification('Failed to update status', true);
                }
            });
            */
    });
  });

  // Delete order functionality
  document.querySelectorAll(".delete-all").forEach((button) => {
    button.addEventListener("click", function () {
      const userName = this.dataset.user;
      const tableNumber = this.dataset.table;

      showConfirmationDialog(
        "Delete Order",
        `Are you sure you want to delete the entire order for ${userName} at Table ${tableNumber}?`,
        () => {
          // This would be the actual deletion logic
          const orderElement = this.closest(".order");
          orderElement.style.animation = "fadeOut 0.5s ease";

          setTimeout(() => {
            orderElement.remove();
            showNotification("Order deleted successfully");

            // Here you would typically send an AJAX request to delete the order on the server
            /*
                        fetch('/delete-order', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                user_name: userName,
                                table_number: tableNumber
                            })
                        });
                        */

            // Check if no orders left
            if (document.querySelectorAll(".order").length === 0) {
              document.querySelector(".orders-container").innerHTML =
                '<p class="no-orders">No orders found.</p>';
            }
          }, 500);
        }
      );
    });
  });

  // Item quantity and delete functionality
  document.querySelectorAll(".action-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const action = this.classList.contains("plus")
        ? "increase"
        : this.classList.contains("minus")
        ? "decrease"
        : "delete";
      const userName = this.dataset.user;
      const tableNumber = this.dataset.table;
      const itemName = this.dataset.item;

      if (action === "delete") {
        showConfirmationDialog(
          "Delete Item",
          `Are you sure you want to remove ${itemName} from this order?`,
          () => {
            // This would be the actual deletion logic
            const row = this.closest("tr");
            row.style.animation = "fadeOut 0.3s ease";

            setTimeout(() => {
              row.remove();
              showNotification(`${itemName} removed from order`);

              // Here you would typically send an AJAX request to update the order on the server
              /*
                            fetch('/update-order-item', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    user_name: userName,
                                    table_number: tableNumber,
                                    item_name: itemName,
                                    action: 'delete'
                                })
                            });
                            */

              // Update the order total
              updateOrderTotal(this.closest("table"));
            }, 300);
          }
        );
      } else {
        // For plus/minus buttons - update quantity
        const row = this.closest("tr");
        const quantityCell = row.querySelector("td:nth-child(2)");
        let quantity = parseInt(quantityCell.textContent);

        if (action === "increase") {
          quantity++;
        } else if (action === "decrease" && quantity > 1) {
          quantity--;
        }

        quantityCell.textContent = quantity;

        // Update the total for this item
        const price = parseFloat(
          row.querySelector("td:nth-child(3)").textContent.replace("₹", "")
        );
        const totalCell = row.querySelector("td:nth-child(4)");
        totalCell.textContent = "₹" + (price * quantity).toFixed(2);

        // Update the order total
        updateOrderTotal(this.closest("table"));

        // Show notification
        showNotification(`${itemName} quantity updated to ${quantity}`);

        // Here you would typically send an AJAX request to update the order on the server
        /*
                fetch('/update-order-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_name: userName,
                        table_number: tableNumber,
                        item_name: itemName,
                        action: action,
                        quantity: quantity
                    })
                });
                */
      }
    });
  });

  function updateOrderTotal(table) {
    let orderTotal = 0;
    table.querySelectorAll("tbody tr").forEach((row) => {
      const total = parseFloat(
        row.querySelector("td:nth-child(4)").textContent.replace("₹", "")
      );
      orderTotal += total;
    });

    table.querySelector("tfoot td:nth-child(2)").textContent =
      "₹" + orderTotal.toFixed(2);
  }

  // Notification system
  function showNotification(message, isError = false) {
    const notification = document.createElement("div");
    notification.className = `notification ${isError ? "error" : ""}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 3000);
  }

  // Confirmation dialog system
  function showConfirmationDialog(title, message, confirmCallback) {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    const dialog = document.createElement("div");
    dialog.className = "confirmation-dialog";
    dialog.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="confirmation-buttons">
                <button class="cancel-btn">Cancel</button>
                <button class="confirm-btn">Confirm</button>
            </div>
        `;
    document.body.appendChild(dialog);

    setTimeout(() => {
      overlay.classList.add("show");
      dialog.classList.add("show");
    }, 10);

    function closeDialog() {
      overlay.classList.remove("show");
      dialog.classList.remove("show");
      setTimeout(() => {
        overlay.remove();
        dialog.remove();
      }, 300);
    }

    dialog.querySelector(".cancel-btn").addEventListener("click", closeDialog);
    dialog.querySelector(".confirm-btn").addEventListener("click", function () {
      closeDialog();
      confirmCallback();
    });
  }

  // Add CSS animations dynamically
  const style = document.createElement("style");
  style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }
    `;
  document.head.appendChild(style);
});
