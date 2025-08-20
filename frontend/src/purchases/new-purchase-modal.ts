import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { renderPurchasesList } from "./purchases-dom";
import { loadPurchasesAPI, postPurchaseAPI } from "./purchases-service";
import { setupSupplierAutoComplete } from "../utils/autocomplete";
import { formatCurrency, setupCurrencyInputs } from "../utils/formatters";
import { resetPurchaseItemSummary } from "./purchase-item-summary";
import { addItemRowTo } from "./purchase-item-dom";

const newPurchaseModal = document.getElementById("new-purchase-modal")!;
const form = document.getElementById("new-purchase-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-new-purchase")!;
const cancelBtn = document.getElementById("cancel-new-purchase")!;
const itemsBodyNew = document.getElementById("items-body-new-purchase-modal")!;
const addItemBtnNew = document.getElementById("add-item-new-purchase-modal")!;

const inputFornecedorSearch = document.getElementById("fornecedor-search") as HTMLInputElement;
const inputFornecedorId = document.getElementById("fornecedor-id") as HTMLInputElement;
const suggestions = document.getElementById("fornecedor-suggestions") as HTMLUListElement;

setupSupplierAutoComplete(inputFornecedorSearch,inputFornecedorId, suggestions);

let originalFormData: Record<string, string> = {};

// Abre o modal com os campos vazios;
export function openNewPurchaseModal() {
  form.reset(); // Reseta os campos do formulário.
  itemsBodyNew.innerHTML = "";
  resetPurchaseItemSummary();

  newPurchaseModal.classList.remove("hidden");
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
      newPurchaseModal.classList.add("hidden");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // Evita reload da página

  // Pega as linhas de itens do purchase-item-dom.ts
  const itemRows = Array.from(itemsBodyNew.querySelectorAll("tr"));
  if (itemRows.length === 0) {
    return showMessage("Obrigatório adicionar um item.")
  }

  const itens = itemRows.map(row => ({
    produto_id: (row.querySelector('input[name="item-product-id"]') as HTMLInputElement).value,
    quantidade: (row.querySelector('input[name="item-quantity"]') as HTMLInputElement).value,
    preco_unitario: Number((row.querySelector('input[name="item-unit-price"]') as HTMLInputElement).value.replace(",", ".")),
    desconto_volume: Number((row.querySelector('input[name="item-discount-volume"]') as HTMLInputElement).value.replace(",", ".")),
  }));

  const newPurchaseData = {
    fornecedor_id: (form.elements.namedItem("new-fornecedor-id") as HTMLInputElement).value,
    data_emissao: (form.elements.namedItem("new-data-emissao") as HTMLInputElement).value,
    tipo_pagamento: (form.elements.namedItem("new-tipo-pagamento") as HTMLInputElement).value,
    desconto_financeiro: Number((form.elements.namedItem("new-desconto-financeiro") as HTMLInputElement).value.replace(",", ".")),
    desconto_comercial: Number((form.elements.namedItem("new-desconto-comercial") as HTMLInputElement).value.replace(",", ".")),
    status: (form.elements.namedItem("new-status") as HTMLInputElement).value,
    itens
  }

  try {
    const response = await postPurchaseAPI(newPurchaseData);

    showMessage(response.message || 'Compra cadastrado com sucesso.');

    newPurchaseModal.classList.add("hidden"); //Fecha o modal após enviar.

    renderPurchasesList(await loadPurchasesAPI()); //Recarrega a lista atualizada de compras.
  
  } catch (err: any) {
    console.error("Erro ao cadastrar compra:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar compra.")
  }
  });