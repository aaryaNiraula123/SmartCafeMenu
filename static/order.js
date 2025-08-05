document.addEventListener("DOMContentLoaded", () => {
  const handleAction = async (url, payload) => {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    location.reload();
  };

  document.querySelectorAll(".plus").forEach((btn) =>
    btn.addEventListener("click", () =>
      handleAction("/update_item", {
        user_name: btn.dataset.user,
        item_name: btn.dataset.item,
        action: "add",
      })
    )
  );

  document.querySelectorAll(".minus").forEach((btn) =>
    btn.addEventListener("click", () =>
      handleAction("/update_item", {
        user_name: btn.dataset.user,
        item_name: btn.dataset.item,
        action: "remove",
      })
    )
  );

  document.querySelectorAll(".delete-item").forEach((btn) =>
    btn.addEventListener("click", () =>
      handleAction("/delete_item", {
        user_name: btn.dataset.user,
        item_name: btn.dataset.item,
      })
    )
  );

  document.querySelectorAll(".delete-all").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (confirm(`Delete all orders for ${btn.dataset.user}?`)) {
        handleAction("/delete_order", { user_name: btn.dataset.user });
      }
    })
  );
});
