import { toggleMovementsRow } from "./inventory-events";

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