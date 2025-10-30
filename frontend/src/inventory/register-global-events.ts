import { handleFilterChange, toggleMovementsRow } from "./inventory-events";

export async function registerGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");

    if (!target) return;

    if (target.classList.contains("btn-view-movements")) {
      const produtoId = Number(target.dataset.produtoId);
      const produtoNome = target.dataset.produtoNome ?? "";
      const productRow = target.closest("tr") as HTMLTableRowElement;

      await toggleMovementsRow(productRow, produtoId, produtoNome);
    }
  });
};

// --------------------------------
// Eventos de filtro (input/select)
// --------------------------------
const idInput = document.querySelector("#filtro-id");
const codeInput = document.querySelector("#filtro-codigo");
const nameInput = document.querySelector('#filtro-nome');
const categoryInput = document.querySelector("#filtro-categoria");
const statusSelect = document.querySelector("#filtro-status");
const saldoSelect = document.querySelector("#filtro-saldo");

if (idInput) idInput.addEventListener("input", handleFilterChange);
if (codeInput) codeInput.addEventListener("input", handleFilterChange);
if (nameInput) nameInput.addEventListener("input", handleFilterChange);
if (categoryInput) categoryInput.addEventListener("input", handleFilterChange);
if (statusSelect) statusSelect.addEventListener("change", handleFilterChange);
if (saldoSelect) saldoSelect.addEventListener("change", handleFilterChange);