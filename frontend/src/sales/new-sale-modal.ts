import { setupCustomerAutoComplete } from "../utils/autocomplete";
import { resetSaleItemSummary } from "./sale-item-summary";
import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { setupCurrencyInputs } from "../utils/formatters";
import { showConfirm, showMessage } from "../utils/messages";
import { renderSalesList } from "./sales-dom";
import { loadSalesAPI, postSaleAPI } from "./sales-service";

const newSaleModal = document.getElementById("new-sale-modal")!;
const form = document.getElementById("new-sale-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-new-sale")!;
const cancelBtn = document.getElementById("cancel-new-sale")!;
const itemsBodyNew = document.getElementById("items-body-new-sale-modal")!;
const addItemBtnNew = document.getElementById("add-item-new-sale-modal")!;

const inputClienteSearch = document.getElementById("cliente-search") as HTMLInputElement;
const inputClienteId = document.getElementById("cliente-id") as HTMLInputElement;
const suggestions = document.getElementById("cliente-suggestions") as HTMLUListElement;

setupCustomerAutoComplete(inputClienteSearch, inputClienteId, suggestions);

let originalFormData: Record<string, string> = {};

// Abre o modal com os campos vazios.
export function openNewSaleModal() {
  form.reset();
  itemsBodyNew.innerHTML = "";
  resetSaleItemSummary();

  newSaleModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);

  const todayISO = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("new-data-emissao") as HTMLInputElement;
  dateInput.value = todayISO;

  setupCurrencyInputs();
}

cancelBtn.addEventListener("click", async () => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("As informações serão perdidas, deseja realmente cancelar?");
    if (!confirmed) return;
  }

  newSaleModal.classList.add("hidden");
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const itemRows = Array.from(itemsBodyNew.querySelectorAll("tr"));
  if (itemRows.length === 0) {
    return showMessage("Obrigatório adicionar um item.")
  }

  const isEditing = itemRows.some(row => row.dataset.status !== "salvo");
  if (isEditing) {
    return showMessage("Obrigatório salvar todos os itens antes de salvar a venda.")
  }

  const itens = itemRows.map(row => ({
    produto_id: (row.querySelector('input[name="item-product-id"]') as HTMLInputElement).value,
    quantidade: (row.querySelector('input[name="item-quantity"]') as HTMLInputElement).value,
    preco_unitario: Number((row.querySelector('input[name="item-unit-price"]') as HTMLInputElement).value.replace(",", ".")),
    desconto_volume: Number((row.querySelector('input[name="item-discount-volume"]') as HTMLInputElement).value.replace(",", ".")),
  }));

  const newSaleData = {
    cliente_id: (form.elements.namedItem("new-cliente-id") as HTMLInputElement).value,
    data_emissao: (form.elements.namedItem("new-data-emissao") as HTMLInputElement).value,
    tipo_pagamento: (form.elements.namedItem("new-tipo-pagamento") as HTMLInputElement).value,
    desconto_financeiro: Number((form.elements.namedItem("new-desconto-financeiro") as HTMLInputElement).value.replace(",", ".")),
    desconto_comercial: Number((form.elements.namedItem("new-desconto-comercial") as HTMLInputElement).value.replace(",", ".")),
    status: (form.elements.namedItem("new-status") as HTMLInputElement).value,
    itens
  }

  try {
    const response = await postSaleAPI(newSaleData);

    showMessage(response.message || "Venda cadastrada com sucesso.");

    newSaleModal.classList.add("hidden");

    renderSalesList(await loadSalesAPI());
  
  } catch (err: any) {
    console.error("Erro ao cadastrar venda:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar venda.")
  }
});