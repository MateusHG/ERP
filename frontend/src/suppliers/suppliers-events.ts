import { openEditModal } from "./supplier-edit-modal";
import { renderSuppliersList } from "./suppliers-dom";
import { deleteSupplierAPI, loadSuppliersAPI, searchSuppliersWithFilterAPI } from "./suppliers-service";
import { getFilterValues, showConfirm, showMessage } from "./utils";

// Setup do evento de filtragem.
export function handleFilterChangeEvent() {
  const idInput = document.querySelector('#filtro-id');
  const nameInput = document.querySelector('#filtro-nome');
  const categoryInput = document.querySelector('#filtro-categoria');
  const statusSelect = document.querySelector('#filtro-status');

  [idInput, nameInput, categoryInput, statusSelect].forEach(element => {
    element?.addEventListener("input", async () => {
      const filters = getFilterValues();
      const suppliers = await searchSuppliersWithFilterAPI(filters);
      renderSuppliersList(suppliers);
    });
  });
};

export async function handleFilterChange() {
  const filters = getFilterValues();
  const suppliers = await searchSuppliersWithFilterAPI(filters);
  renderSuppliersList(suppliers);
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