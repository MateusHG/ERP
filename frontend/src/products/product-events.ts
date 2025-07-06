import { deleteProductAPI, loadProductsAPI, searchProductsWithFilterAPI } from "./product-service";
import { getFilterValues, renderProductsList } from "./product-dom";
import { showConfirm, showMessage } from "./utils";
import { openEditModal } from "./product-edit-modal";
import { openNewProductModal } from "./new-product-modal";

// Setup do evento de filtro.
export function setupFilterProductsEvent() {
  const idInput = document.querySelector('#filtro-id');
  const nameInput = document.querySelector('#filtro-nome');
  const categoryInput = document.querySelector('#filtro-categoria');
  const statusSelect = document.querySelector('#filtro-status');

  [idInput, nameInput, categoryInput, statusSelect].forEach(element => {
    element?.addEventListener("input", async () => {
      const filters = getFilterValues();
      const products = await searchProductsWithFilterAPI(filters);
      renderProductsList(products);
    });
  });
};

//"Lida com as mudanças no filtro de busca"
export async function handleFilterChange() {
  const filters = getFilterValues();
  const products = await searchProductsWithFilterAPI(filters);
  renderProductsList(products);
};

//"Lida" com o clique no botão de editar
export function handleEditClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;
  openEditModal(parseInt(id));
};

export function handleNewProductClick(target: HTMLElement) {
  openNewProductModal();
};

//"Lida" com o clique no botão delete.
export async function handleDeleteClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;

  const confirmed = await showConfirm("Deseja realmente excluir este produto?");
  if (!confirmed) return;

  try {
    const response = await deleteProductAPI(parseInt(id));
    showMessage(response.message);

    const products = await loadProductsAPI();
    renderProductsList(products);
  } catch (error: any) {
    showMessage(error.message || "Erro ao deletar o produto.")
  }
};