// fetch orders, populate table, build charts
async function loadAdminData() {
  try {
    const res = await fetch("/api/orders");
    const orders = await res.json();
    const tbody = document.getElementById("orders-tbody");
    tbody.innerHTML = "";

    // Calculate stats
    const todayOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length;

    const todayRevenue = orders.reduce((total, o) => {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      if (orderDate.toDateString() === today.toDateString()) {
        return total + (o.total_amount || 0);
      }
      return total;
    }, 0);

    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "preparing"
    ).length;

    // Update stats cards
    document.getElementById("today-orders").textContent = todayOrders;
    document.getElementById(
      "today-revenue"
    ).textContent = `$${todayRevenue.toFixed(2)}`;
    document.getElementById("pending-orders").textContent = pendingOrders;
    document.getElementById("avg-time").textContent = "22 min"; // This would come from backend

    // populate table
    orders.slice(0, 10).forEach((o) => {
      const tr = document.createElement("tr");
      const itemsStr = o.items
        .map((i) => `<span class="badge">${i.name} x${i.quantity}</span>`)
        .join(" ");
      const statusClass = `status-${o.status.toLowerCase()}`;

      tr.innerHTML = `
            <td>#${o.id}</td>
            <td>${o.user_name}</td>
            <td>${o.table_number}</td>
            <td>${itemsStr}</td>
            <td>$${(o.total_amount || 0).toFixed(2)}</td>
            <td><span class="status ${statusClass}">${o.status}</span></td>
            <td>${formatDate(o.created_at)}</td>
            <td>
              <button class="action-btn" title="Edit"><i class="fas fa-edit"></i></button>
              <button class="action-btn" title="Complete"><i class="fas fa-check"></i></button>
            </td>
          `;
      tbody.appendChild(tr);
    });

    // aggregate counts by item name for bar chart
    const itemCounts = {};
    orders.forEach((o) => {
      o.items.forEach((it) => {
        if (!itemCounts[it.name]) itemCounts[it.name] = 0;
        itemCounts[it.name] += it.quantity || 1;
      });
    });

    // aggregate counts by status for pie chart
    const statusCounts = {};
    orders.forEach((o) => {
      if (!statusCounts[o.status]) statusCounts[o.status] = 0;
      statusCounts[o.status] += 1;
    });

    const itemLabels = Object.keys(itemCounts);
    const itemData = Object.values(itemCounts);

    const statusLabels = Object.keys(statusCounts);
    const statusData = Object.values(statusCounts);
    const statusColors = statusLabels.map((status) => {
      switch (status.toLowerCase()) {
        case "completed":
          return "#4cc9f0";
        case "preparing":
          return "#4361ee";
        case "pending":
          return "#f8961e";
        default:
          return "#6c757d";
      }
    });

    // draw charts using Chart.js
    const itemCtx = document.getElementById("itemsChart").getContext("2d");
    if (window._itemsChart) window._itemsChart.destroy();
    window._itemsChart = new Chart(itemCtx, {
      type: "bar",
      data: {
        labels: itemLabels,
        datasets: [
          {
            label: "Quantity ordered",
            data: itemData,
            backgroundColor: "#4361ee",
            borderRadius: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { mode: "index", intersect: false },
          datalabels: {
            anchor: "end",
            align: "top",
            formatter: (value) => (value > 0 ? value : ""),
            color: "#4361ee",
            font: { weight: "bold" },
          },
        },
        scales: {
          y: { beginAtZero: true, grid: { display: false } },
          x: { grid: { display: false } },
        },
      },
      plugins: [ChartDataLabels],
    });

    const statusCtx = document.getElementById("statusChart").getContext("2d");
    if (window._statusChart) window._statusChart.destroy();
    window._statusChart = new Chart(statusCtx, {
      type: "doughnut",
      data: {
        labels: statusLabels,
        datasets: [
          {
            data: statusData,
            backgroundColor: statusColors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: { position: "right" },
          tooltip: { mode: "index", intersect: false },
          datalabels: {
            formatter: (value, ctx) => {
              const total = ctx.chart.data.datasets[0].data.reduce(
                (a, b) => a + b,
                0
              );
              const percentage = Math.round((value / total) * 100);
              return percentage > 0 ? `${percentage}%` : "";
            },
            color: "#fff",
            font: { weight: "bold" },
          },
        },
      },
      plugins: [ChartDataLabels],
    });
  } catch (error) {
    console.error("Error loading admin data:", error);
  }
}

function formatDate(dateString) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Initial load
loadAdminData();

// Refresh every 10s
setInterval(loadAdminData, 10000);

// Add event listeners for action buttons
document.addEventListener("click", function (e) {
  if (e.target.closest(".action-btn")) {
    const btn = e.target.closest(".action-btn");
    const row = btn.closest("tr");
    const orderId = row.cells[0].textContent.replace("#", "");

    if (btn.querySelector(".fa-check")) {
      // Complete order action
      completeOrder(orderId, row);
    } else if (btn.querySelector(".fa-edit")) {
      // Edit order action
      editOrder(orderId);
    }
  }
});

async function completeOrder(orderId, row) {
  try {
    const response = await fetch(`/api/orders/${orderId}/complete`, {
      method: "PUT",
    });

    if (response.ok) {
      row.querySelector(".status").textContent = "completed";
      row.querySelector(".status").className = "status status-completed";
      loadAdminData(); // Refresh data
    }
  } catch (error) {
    console.error("Error completing order:", error);
  }
}

function editOrder(orderId) {
  // In a real app, this would open a modal or redirect to an edit page
  console.log("Editing order:", orderId);
  alert(`Editing order #${orderId}`);
}
