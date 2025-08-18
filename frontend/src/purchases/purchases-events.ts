import { openEditModal } from "./purchase-edit-modal"
import { getFilterValues } from "./purchases-dom";
import { showConfirm, showMessage } from "../utils/messages";
import { renderPurchasesList } from "./purchases-dom";
import { openNewPurchaseModal } from "./new-purchase-modal";
import { loadPurchasesAPI, searchPurchasesWithFilterAPI } from "./purchases-service";
import { addItemRowTo } from "./purchase-item-dom";
import { updatePurchaseItemSummary } from "./purchase-item-summary";
import { updateTotalPurchaseDisplay } from "./purchase-summary";

// Setup do evento de filtragem.
export function handleFilterChangeEvent() {
  const idInput = document.querySelector('#filtro-id');
  const nomeFornecedorInput = document.querySelector('#filtro-nome-fornecedor');
  const statusSelect = document.querySelector('#filtro-status');

  [idInput, nomeFornecedorInput].forEach(element => {
    element?.addEventListener("input", async () => {
      const filters = getFilterValues();
      const purchases = await searchPurchasesWithFilterAPI(filters);
      renderPurchasesList(purchases);
    });
  });

  // Campo select: usar 'change'
  statusSelect?.addEventListener("change", async () => {
    const filters = getFilterValues();
    const purchases = await searchPurchasesWithFilterAPI(filters);
    renderPurchasesList(purchases);
  });
}

export async function handleFilterChange() {
  const filters = getFilterValues();
  const purchases = await searchPurchasesWithFilterAPI(filters);
  renderPurchasesList(purchases);
};

export async function handleNewPurchaseClick(target: HTMLElement) {
  openNewPurchaseModal();
};

export async function handleEditClick(target: HTMLElement) {
  const id = target.dataset.id;
  if(!id) return;
  openEditModal(parseInt(id));
};


export async function handleDeleteClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;

  const confirmed = await showConfirm("Deseja realmente excluir esta compra?");
  if (!confirmed) return;

  try {
    const response = await deletePurchaseAPI(parseInt(id));
    showMessage(response.message);

    const purchases = await loadPurchasesAPI();
    renderPurchasesList(purchases);
  } catch (error: any) {
    showMessage(error.message || 'Erro ao deletar compra.')
  }
};

export async function handleNewPurchaseItemClick(button: HTMLElement) {
  const modal = button.closest(".modal")!;
  const tbody = modal.querySelector("tbody")!;
  const prefix: "new" | "edit" = modal.id === "edit-modal" ? "edit" : "new";
  
  addItemRowTo(tbody, undefined, prefix, false);
}

export function setupPurchaseEvents() {
  // Delegação de evento para qualquer input dentro de tbody
  document.removeEventListener("input", handleInputDelegation);
  document.addEventListener("input", handleInputDelegation);

  function handleInputDelegation(e: Event) {
    const target = e.target as HTMLInputElement;
    if (
        target.name === "item-quantity" ||
        target.name === "item-unit-price" ||
        target.name === "item-discount-volume"
      ) {
      // Encontra o tbody mais próximo para atualizar o resumo.
      const tbody = target.closest("tbody");
      if (tbody) {
        const prefix = tbody.closest(".modal")?.id === "edit-modal" ? "edit" : "new";
        updatePurchaseItemSummary(tbody, prefix);
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
        updateTotalPurchaseDisplay(prefix as "new" | "edit");
      });
    }
  });

  document.addEventListener("itemsUpdated", (e: any) => {
    const prefix = e.detail?.prefix || "new";
    updateTotalPurchaseDisplay(prefix);
  });
}

setupPurchaseEvents();