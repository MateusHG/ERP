import { openNewCustomerModal } from "./new-customer-modal";
import { openEditModal } from "./customer-edit-modal";
import { getFilterValues, renderCustomersList } from "./customers-dom";
import { deleteCustomerAPI, loadCustomersAPI, searchCustomersWithFilterAPI } from "./customers-service";
import { showConfirm, showMessage } from "../utils/messages";

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
      const suppliers = await searchCustomersWithFilterAPI(filters);
      renderCustomersList(suppliers);
    });
  });

  // Campo select: usar 'change'
  statusSelect?.addEventListener("change", async () => {
    const filters = getFilterValues();
    const suppliers = await searchCustomersWithFilterAPI(filters);
    renderCustomersList(suppliers);
  });
}

export async function handleFilterChange() {
  const filters = getFilterValues();
  const suppliers = await searchCustomersWithFilterAPI(filters);
  renderCustomersList(suppliers);
};

export async function handleNewCustomerClick(target: HTMLElement) {
  openNewCustomerModal();
};

export async function handleEditClick(target: HTMLElement) {
  const id = target.dataset.id;
  if(!id) return;
  openEditModal(parseInt(id));
};


export async function handleDeleteClick(target: HTMLElement) {
  const id = target.dataset.id;
  if (!id) return;

  const confirmed = await showConfirm("Deseja realmente excluir este cliente?");
  if (!confirmed) return;

  try {
    const response = await deleteCustomerAPI(parseInt(id));
    showMessage(response.message);

    const customers = await loadCustomersAPI();
    renderCustomersList(customers);
  } catch (error: any) {
    showMessage(error.message || 'Erro ao deletar cliente.')
  }
};