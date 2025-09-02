import { showConfirm, showMessage } from "../utils/messages";
import { openNewSaleModal } from "./new-sale-modal";
import { openEditModal } from "./sale-edit-modal";
import { addItemRowTo } from "./sale-item-dom";
import { updateSaleItemSummary } from "./sale-item-summary";
import { updateTotalSaleDisplay } from "./sale-summary";
import { getFilterValues, renderSalesList } from "./sales-dom";
import { deleteSaleAPI, loadSalesAPI, searchSalesWithFilterAPI } from "./sales-service";

// Setup do evento de filtragem.
export function handleFilterChangeEvent() {
  const idInput = document.querySelector("#filtro-id");
  const nomeClienteInput = document.querySelector("filtro-nome-cliente");
  const statusSelect = document.querySelector('#filtro-status');

  [idInput, nomeClienteInput].forEach(element => {
    element?.addEventListener("input", async () => {
      const filters = getFilterValues();
      const sales = await searchSalesWithFilterAPI(filters);
      renderSalesList(sales);
    });
  });

  statusSelect?.addEventListener("change", async () => {
    const filters = getFilterValues();
    const sales = await searchSalesWithFilterAPI(filters);
    renderSalesList(sales);
  });
};

export async function handleFilterChange() {
  const filters = getFilterValues();
  const sales = await searchSalesWithFilterAPI(filters);
  renderSalesList(sales);
};

export async function handleNewSaleClick(target: HTMLElement) {
  openNewSaleModal();
};

export async function handleEditClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;
  openEditModal(parseInt(id));
};

export async function handleDeleteClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;
  
  const confirmed = await showConfirm("Deseja realmente excluir esta venda?");
  if (!confirmed) return;

  try {
    const response = await deleteSaleAPI(parseInt(id));
    showMessage(response.message);

    const sales = await loadSalesAPI();
    renderSalesList(sales);
  } catch (error: any) {
    showMessage(error.message || "Erro ao deletar venda.")
  }
};

export async function handleNewSaleItemClick(button: HTMLElement) {
  const modal = button.closest(".modal")!;
  const tbody = modal.querySelector("tbody")!;
  const prefix: "new" | "edit" = modal.id === "edit-modal" ? "edit" : "new";

  addItemRowTo(tbody, undefined, prefix, false);
};

export function setupSaleEvents() {
  document.removeEventListener("input", handleInputDelegation);
  document.addEventListener("input", handleInputDelegation);

  function handleInputDelegation(e: Event) {
    const target = e.target as HTMLInputElement;
    if (
      target.name === "item-quantity" ||
      target.name === "item-unit-price" ||
      target.name === "item-discount-volume"
    ) {
      const tbody = target.closest("tbody");
      if (tbody) {
        const prefix = tbody.closest(".modal")?.id === "edit-modal" ? "edit" : "new";
        updateSaleItemSummary(tbody, prefix);
      }
    }
  }

  [["new-desconto-financeiro", "new"],
   ["edit-desconto-financeiro", "edit"],
   ["new-desconto-comercial", "new"],
   ["edit-desconto-comercial", "edit"],
  ].forEach(([id, prefix]) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => {
        document.dispatchEvent(new CustomEvent("itemsUpdated", {detail: { prefix }}));
        updateTotalSaleDisplay(prefix as "new" | "edit");
      });
    }
  });

  document.addEventListener("itemsUpdated", (e: any) => {
    const prefix = e.detail?.prefix || "new";
    updateTotalSaleDisplay(prefix);
  });
}

setupSaleEvents();