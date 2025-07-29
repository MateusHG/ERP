import { handleDeleteClick, handleEditClick, handleFilterChange, handleNewCustomerClick } from "./customers-events";

export function registerGlobalEvents() {
  document.addEventListener("click", async (event) => {
    const target = (event.target as HTMLElement).closest("button");

    if (!target) return;

    if (target.classList.contains("btn-delete")) {
      await handleDeleteClick(target);
    
    } else if (target.classList.contains("btn-edit")) {
      await handleEditClick(target);
    
    } else if (target.classList.contains("btn-new-customer")) {
      await handleNewCustomerClick(target);
    }
  });


// -------------------------
// Eventos de filtro (input/select)
// -------------------------
  const idInput = document.querySelector('#filtro-id');
  const nomeFantasiaInput = document.querySelector('#filtro-nome-fantasia');
  const razaoSocialInput = document.querySelector('#filtro-razao-social');
  const cnpjInput = document.querySelector('#filtro-cnpj');
  const emailInput = document.querySelector('#filtro-email');
  const statusSelect = document.querySelector('#filtro-status');

  if (idInput) idInput.addEventListener("input", handleFilterChange);
  if (nomeFantasiaInput) nomeFantasiaInput.addEventListener("input", handleFilterChange);
  if (razaoSocialInput) razaoSocialInput.addEventListener("input", handleFilterChange);
  if (cnpjInput) cnpjInput.addEventListener("input", handleFilterChange);
  if (emailInput) emailInput.addEventListener("input", handleFilterChange);
  if (statusSelect) statusSelect.addEventListener("change", handleFilterChange);
};