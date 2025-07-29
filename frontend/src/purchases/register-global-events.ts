import { handleDeleteClick, handleEditClick, handleFilterChange, handleNewPurchaseClick } from "./purchases-events";

export function registerGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");

    if (!target) return;

    if (target.classList.contains("btn-delete")) {
      await handleDeleteClick(target);
    
    } else if (target.classList.contains("btn-edit")) {
      await handleEditClick(target);
    
    } else if (target.classList.contains("btn-new-purchase")) {
      await handleNewPurchaseClick(target);
    }
  });


// -------------------------
// Eventos de filtro (input/select)
// -------------------------
  const idInput = document.querySelector('#filtro-id');
  const nomeFornecedorInput = document.querySelector('#filtro-nome-fornecedor');
  const statusSelect = document.querySelector('#filtro-status');

  if (idInput) idInput.addEventListener("input", handleFilterChange);
  if (nomeFornecedorInput) nomeFornecedorInput.addEventListener("input", handleFilterChange);
  if (statusSelect) statusSelect.addEventListener("change", handleFilterChange);
};