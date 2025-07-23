import { openNewSupplierModal } from "./new-supplier-modal";
import { openEditModal } from "./supplier-edit-modal";
import { getFilterValues, renderSuppliersList } from "./suppliers-dom";
import { deleteSupplierAPI, loadSuppliersAPI, searchSuppliersWithFilterAPI } from "./suppliers-service";
import { showConfirm, showMessage } from "./utils";

// Setup do evento de filtragem.
export function handleFilterChangeEvent() {
  const idInput = document.querySelector('#filtro-id');
  const nomeFantasiaInput = document.querySelector('#filtro-nome-fantasia');
  const razaoSocialInput = document.querySelector('#filtro-razao-social');
  const cnpjInput = document.querySelector('#filtro-cnpj');
  const emailInput = document.querySelector('#filtro-email');
  const statusSelect = document.querySelector('#filtro-status');

  [idInput, nomeFantasiaInput, razaoSocialInput, cnpjInput, emailInput].forEach(element => {
    element?.addEventListener("input", async () => {
      const filters = getFilterValues();
      const suppliers = await searchSuppliersWithFilterAPI(filters);
      renderSuppliersList(suppliers);
    });
  });

  // Campo select: usar 'change'
  statusSelect?.addEventListener("change", async () => {
    const filters = getFilterValues();
    const suppliers = await searchSuppliersWithFilterAPI(filters);
    renderSuppliersList(suppliers);
  });
}

export async function handleFilterChange() {
  const filters = getFilterValues();
  const suppliers = await searchSuppliersWithFilterAPI(filters);
  renderSuppliersList(suppliers);
};

export async function handleNewSupplierClick(target: HTMLElement) {
  openNewSupplierModal();
};

export async function handleEditClick(target: HTMLElement) {
  const id = target.dataset.id;
  if(!id) return;
  openEditModal(parseInt(id));
};


export async function handleDeleteClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;

  const confirmed = await showConfirm("Deseja realmente excluir este fornecedor?");
  if (!confirmed) return;

  try {
    const response = await deleteSupplierAPI(parseInt(id));
    showMessage(response.message);

    const suppliers = await loadSuppliersAPI();
    renderSuppliersList(suppliers);
  } catch (error: any) {
    showMessage(error.message || 'Erro ao deletar fornecedor.')
  }
}