import { openEditModal } from "./purchase-edit-modal"
import { getFilterValues } from "./purchases-dom";
import { showConfirm, showMessage } from "../utils/messages";
import { renderPurchasesList } from "./purchases-dom";
import { openNewPurchaseModal } from "./new-purchase-modal";
import { loadPurchasesAPI, searchPurchasesWithFilterAPI } from "./purchases-service";
import { createEditableRow } from "./purchase-item-dom";

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

export async function handleNewPurchaseItemClick(target: HTMLElement) {
  const itemsBody = document.getElementById("items-body")! as HTMLTableSectionElement;
  const row = createEditableRow();
  itemsBody.appendChild(row);
};