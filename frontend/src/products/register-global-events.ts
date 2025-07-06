import { handleDeleteClick, handleEditClick, handleNewProductClick } from "./product-events";

// Arquivo responsável por escutar eventos globais (cliques em botões, etc.)
export function registerGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");

    if (!target) return;

    if (target.classList.contains("btn-delete")) {
      await handleDeleteClick(target);

    } else if (target.classList.contains("btn-edit")) {
      await handleEditClick(target);
      
    } else if (target.classList.contains("btn-new-product")) {
      await handleNewProductClick(target);
    }
  });
}