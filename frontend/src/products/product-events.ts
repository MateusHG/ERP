import { deleteProductAPI, loadProductsAPI } from "./product-service";
import { renderProductsList } from "./product-dom";
import { showConfirm, showMessage } from "./utils";
import { openEditModal } from "./product-edit-modal";
import { openNewProductModal } from "./new-product-modal";

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

//"Lida" com o clique no botão de editar
export function handleEditClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;
  openEditModal(parseInt(id));
};

export function handleNewProductClick(target: HTMLElement) {
  openNewProductModal();
};