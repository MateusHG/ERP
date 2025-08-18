import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { getItemsByPurchaseIdAPI, getPurchaseByIdAPI, loadPurchasesAPI } from "./purchases-service";
import { renderPurchasesList } from "./purchases-dom";
import { addItemRowTo } from "./purchase-item-dom";
import { setupSupplierAutoComplete } from "../utils/autocomplete";
import { updatePurchaseItemSummary } from "./purchase-item-summary";
import { updateTotalPurchaseDisplay } from "./purchase-summary";
import { formatCurrency } from "../utils/formatters";

const modal = document.getElementById("edit-modal")!;
const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};

export async function openEditModal(id: number) {
  currentEditId = id;

  const purchase = await getPurchaseByIdAPI(id);
  console.log("Compra:", purchase);

  // Seleciona os inputs dentro do modal de edição
  const inputFornecedorSearch = modal.querySelector<HTMLInputElement>('#fornecedor-search')!;
  const inputFornecedorId = modal.querySelector<HTMLInputElement>('#fornecedor-id')!;
  const suggestions = modal.querySelector<HTMLUListElement>('#fornecedor-suggestions')!;
  const inputDataEmissao = modal.querySelector<HTMLInputElement>('input[name="data-emissao"]')!;
  const inputTipoPagamento = modal.querySelector<HTMLSelectElement>('select[name="tipo-pagamento"]')!;
  const inputDescontoFinanceiro = modal.querySelector<HTMLInputElement>('input[name="desconto-financeiro"]')!;
  const inputDescontoComercial = modal.querySelector<HTMLInputElement>('input[name="desconto-comercial"]')!;
  const inputStatus = modal.querySelector<HTMLSelectElement>('select[name="status"]')!;

  // Preenche os campos
  inputFornecedorSearch.value = purchase.fornecedor_nome || "";
  inputFornecedorId.value = String(purchase.fornecedor_id);
  setupSupplierAutoComplete(inputFornecedorSearch, inputFornecedorId, suggestions)

  inputDataEmissao.value = purchase.data_emissao ? purchase.data_emissao.split("T")[0] : "";
  inputTipoPagamento.value = purchase.tipo_pagamento || "";
  inputDescontoFinanceiro.value = formatCurrency(purchase.desconto_financeiro || 0);
  inputDescontoComercial.value = formatCurrency(purchase.desconto_comercial || 0);
  inputStatus.value = purchase.status || "";

  // Carrega os itens da compra
  const itemsBody = modal.querySelector("#items-body-edit-modal") as HTMLTableSectionElement;
  itemsBody.innerHTML = "";

  const items = await getItemsByPurchaseIdAPI(id);
  items.forEach(item => {
    addItemRowTo(itemsBody, {
      produto_id: item.produto_id,
      produto_codigo: item.produto_codigo || "",
      produto_nome: item.produto_nome || "",
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      desconto_volume: item.desconto_volume || "0.00",
      valor_subtotal: item.valor_subtotal
    }, "edit", true); // prefix = "edit", isSaved = true
  });

  updatePurchaseItemSummary(itemsBody, "edit");
  updateTotalPurchaseDisplay("edit");

  modal.classList.remove("hidden");
  originalFormData = getFormDataSnapshot(form);
}

cancelBtn?.addEventListener("click", async () => {
  if (isFormChanged(form, originalFormData)) {
    const confirmed = await showConfirm("Você tem alterações não salvas. Deseja realmente sair?");
    if (!confirmed) return;
}
    modal.classList.add("hidden");
    currentEditId = null;
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!currentEditId) return;

  const formData = new FormData(form);

    const updatedPurchaseData = {
      fornecedor_id: formData.get("edit-fornecedor-id")?.toString() || "",
      data_emissao: formData.get("edit-data-emissao")?.toString() || "",
      tipo_pagamento: formData.get("edit-tipo-pagamento")?.toString() || "",
      desconto_financeiro: Number(formData.get("edit-desconto-financeiro") || 0),
      desconto_comercial: Number(formData.get("edit-desconto-comercial") || 0),
      status: formData.get("edit-status")?.toString() || "",
    // Itens da compra podem ser enviados separados ou em outra rota
  };

  try {
    const response = await updatePurchaseAPI(currentEditId, updatedPurchaseData);
    showMessage(response.message);

    modal.classList.add("hidden");
    renderPurchasesList(await loadPurchasesAPI());

  } catch (err: any) {
    showMessage(err.message);
  }
});