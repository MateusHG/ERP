import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { renderPurchasesList } from "./purchases-dom";
import { loadPurchasesAPI, postPurchaseAPI } from "./purchases-service";
import { setupSupplierAutoComplete } from "../utils/autocomplete";
import { parseCurrency, setupCurrencyInputs } from "../utils/formatters";
import { resetPurchaseItemSummary } from "./purchase-item-summary";

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

  const isEditing = itemRows.some(row => row.dataset.status !== "salvo");
  if (isEditing) {
    return showMessage("Obrigatório salvar todos os itens antes de salvar a compra.")
  }

  const totalPurchase =  document.getElementById("new-valor-total") as HTMLInputElement;
  const totalPurchaseValue = parseCurrency(totalPurchase.value);

  if (totalPurchaseValue < 0) {
    return showMessage("O valor total da compra não pode ser negativo.");
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
    // =========================
    // Validação de status
    // =========================
    const currentStatus = (newPurchaseData.status || "").toLocaleLowerCase();

    const statusesFinalized = ["recebido", "finalizado"];
    const statusesOpen = ["aberto", "aguardando", "aprovado", "cancelado"];

    const isFinalized = statusesFinalized.includes(currentStatus);

    if (isFinalized) {
      const confirmed = await showConfirm(
        "<b>🛑 Atenção! 🛑</b><br><br>" +
        "Salvar a compra com status <b>'Finalizado'</b> ou <b>'Recebido'</b> fará o sistema <b>dar entrada no estoque.</b><br><br>" +
        "<b>Deseja continuar?</b>"
      );

      if (!confirmed) {
        await showMessage(
          "<b>Operação cancelada ✅</b><br><br>" +
          "- Estoque não foi alterado."
        );
        return;
      }
    }

    
    // =========================
    // Envio compra ao backend
    // =========================
    const response = await postPurchaseAPI(newPurchaseData);

    showMessage(response.message || 'Compra cadastrado com sucesso.');

    newPurchaseModal.classList.add("hidden"); //Fecha o modal após enviar.

    renderPurchasesList(await loadPurchasesAPI()); //Recarrega a lista atualizada de compras.
  
  } catch (err: any) {
    console.error("Erro ao cadastrar compra:", err);
    showMessage(err.message || "Erro desconhecido ao cadastrar compra.")
  }
  });