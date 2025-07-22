import { handleDeleteClick, handleEditClick, handleFilterChange } from "./suppliers-events";

export function registerGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");

    if (!target) return;

    if (target.classList.contains("btn-delete")) {
      await handleDeleteClick(target);
    
    } else if (target.classList.contains("btn-edit")) {
      await handleEditClick(target);
    
    } else if (target.classList.contains("btn-new-supplier")) {
      await handleNewSupplierClick(target);
    }
  });
}

// -------------------------
// Eventos de filtro (input/select)
// -------------------------
const idInput = document.querySelector('#filtro-id');
const nameInput = document.querySelector('#filtro-nome');
const categoryInput = document.querySelector('#filtro-categoria');
const statusSelect = document.querySelector('#filtro-status');

if (idInput) idInput.addEventListener("input", handleFilterChange);
if (nameInput) nameInput.addEventListener("input", handleFilterChange);
if (categoryInput) categoryInput.addEventListener("input", handleFilterChange);
if (statusSelect) statusSelect.addEventListener("change", handleFilterChange);