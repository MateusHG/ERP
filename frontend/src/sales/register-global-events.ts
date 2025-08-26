import { handleDeleteClick, handleEditClick, handleFilterChange, handleNewSaleClick, handleNewSaleItemClick } from "./sales-events";

export function registerGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");

    if (!target) return;

    if (target.classList.contains("btn-delete")) {
      await handleDeleteClick(target);

    } else if (target.classList.contains("btn-edit")) {
      await handleEditClick(target);
    
    } else if (target.classList.contains("btn-new-sale")) {
      await handleNewSaleClick(target);
    
    } else if (target.classList.contains("add-item-btn")) {
      await handleNewSaleItemClick(target);
    }
  });


// -------------------------
// Eventos de filtro (input/select)
// -------------------------
const idInput = document.querySelector('#filtro-id');
const nomeClienteInput = document.querySelector("#filtro-nome-cliente");
const statusSelect = document.querySelector("filtro-status");

if (idInput) idInput.addEventListener("input", handleFilterChange);
if (nomeClienteInput) nomeClienteInput.addEventListener("input", handleFilterChange);
if (statusSelect) statusSelect.addEventListener("change", handleFilterChange);

};