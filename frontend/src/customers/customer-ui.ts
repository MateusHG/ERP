// Atualiza o badge de status do modal de edição 

export function updateCustomerStatusBadge(status: string) {
  const badge = document.getElementById("edit-status-badge") as HTMLSpanElement;
  if (!badge) return;

  badge.classList.remove("badge-active", "badge-inactive");

  if (status === "ativo") {
    badge.textContent = "Ativo";
    badge.classList.add("badge-active");
  } else {
    badge.textContent = "Inativo";
    badge.classList.add("badge-inactive");
  }
};