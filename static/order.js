// fetch orders, populate table, build chart
async function loadAdminData() {
  const res = await fetch("/api/orders");
  const orders = await res.json();
  const tbody = document.getElementById("orders-tbody");
  tbody.innerHTML = "";

  // populate table
  orders.forEach((o) => {
    const tr = document.createElement("tr");
    const itemsStr = o.items.map((i) => `${i.name} x${i.quantity}`).join(", ");
    tr.innerHTML = `<td>${o.id}</td><td>${o.user_name}</td><td>${o.table_number}</td><td>${itemsStr}</td><td>${o.status}</td><td>${o.created_at}</td>`;
    tbody.appendChild(tr);
  });

  // aggregate counts by item name
  const counts = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      if (!counts[it.name]) counts[it.name] = 0;
      counts[it.name] += it.quantity || 1;
    });
  });

  const labels = Object.keys(counts);
  const data = Object.values(counts);

  // draw chart using Chart.js
  const ctx = document.getElementById("itemsChart").getContext("2d");
  if (window._itemsChart) window._itemsChart.destroy();
  window._itemsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Quantity ordered",
          data,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

loadAdminData();
// refresh every 10s
setInterval(loadAdminData, 10000);
