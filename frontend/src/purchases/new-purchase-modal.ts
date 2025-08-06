import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { renderPurchasesList } from "./purchases-dom";
import { loadPurchasesAPI, postPurchaseAPI } from "./purchases-service";
import { setupSupplierAutoComplete } from "../utils/autocomplete";
import { formatCurrency, setupCurrencyInputs } from "../utils/formatters";

const newPurchaseModal = document.getElementById("new-purchase-modal")!;
const form = document.getElementById("new-purchase-form") as HTMLFormElement;
const submitBtn = document.getElementById("submit-new-purchase")!;
const cancelBtn = document.getElementById("cancel-new-purchase")!;

setupSupplierAutoComplete("fornecedor-search", "fornecedor-id", "fornecedor-suggestions");

let originalFormData: Record<string, string> = {};

// Abre o modal com os campos vazios;
export function openNewPurchaseModal() {
  form.reset(); // Reseta os campos do formulário.
  newPurchaseModal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);

  const todayISO = new Date().toISOString().split("T")[0];
  const dateInput = document.getElementById("edit-data-emissao") as HTMLInputElement;
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

  const newPurchaseData = {
    fornecedor: (form.elements.namedItem("fornecedor") as HTMLInputElement).value,
    data_emissao: (form.elements.namedItem("data-emissao") as HTMLInputElement).value,
    tipo_pagamento: (form.elements.namedItem("tipo-pagamento") as HTMLInputElement).value,
    status: (form.elements.namedItem("status") as HTMLInputElement).value,
    desconto_financeiro: (form.elements.namedItem("desconto-financeiro") as HTMLInputElement).value,
    desconto_comercial: (form.elements.namedItem("desconto-comercial") as HTMLInputElement).value,
  };

  try {
    const response = await postPurchaseAPI(newPurchaseData);
    showMessage(response.message || 'Compra cadastrado com sucesso.');

    newPurchaseModal.classList.add("hidden"); //Fecha o modal após enviar.

    renderPurchasesList(await loadPurchasesAPI()); //Recarrega a lista atualizada de compras.
  
  } catch (err: any) {
    console.error("Erro ao cadastrar fornecedor:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar compra.")
  }
  });