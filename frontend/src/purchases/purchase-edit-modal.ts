import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showMessage } from "../utils/messages";
import { getItemsByPurchaseIdAPI, getPurchaseByIdAPI, loadPurchasesAPI, updatePurchaseAPI } from "./purchases-service";
import { renderPurchasesList } from "./purchases-dom";
import { addItemRowTo } from "./purchase-item-dom";
import { setupSupplierAutoComplete } from "../utils/autocomplete";
import { updatePurchaseItemSummary } from "./purchase-item-summary";
import { updateTotalPurchaseDisplay } from "./purchase-summary";
import { collectPurchaseItems } from "./purchase-items-controller";

const modal = document.getElementById("edit-modal")!;
const form = document.getElementById("edit-form") as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

// Seleciona os inputs dentro do modal de edição
const inputFornecedorSearch = modal.querySelector<HTMLInputElement>('#fornecedor-search')!;
const inputFornecedorId = modal.querySelector<HTMLInputElement>('#fornecedor-id')!;
const suggestions = modal.querySelector<HTMLUListElement>('#fornecedor-suggestions')!;

setupSupplierAutoComplete(inputFornecedorSearch, inputFornecedorId, suggestions);

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};
let originalItems: any[] = [];

// --------------------------------------------------------------------------------------------------
 
export async function openEditModal(id: number) {
  currentEditId = id;

  const purchase = await getPurchaseByIdAPI(id);

    // Preenche campo do fornecedor.
  inputFornecedorSearch.value = purchase.fornecedor_nome || "";
  inputFornecedorId.value = String(purchase.fornecedor_id || "");

  const inputDataEmissao = modal.querySelector<HTMLInputElement>('input[name="edit-data-emissao"]')!;
  const inputTipoPagamento = modal.querySelector<HTMLSelectElement>('select[name="edit-tipo-pagamento"]')!;
  const inputDescontoFinanceiro = modal.querySelector<HTMLInputElement>('input[name="edit-desconto-financeiro"]')!;
  const inputDescontoComercial = modal.querySelector<HTMLInputElement>('input[name="edit-desconto-comercial"]')!;
  const inputStatus = modal.querySelector<HTMLSelectElement>('select[name="edit-status"]')!;
  

  inputDataEmissao.value = purchase.data_emissao ? purchase.data_emissao.split("T")[0] : "";
  inputTipoPagamento.value = purchase.tipo_pagamento || "";
  
  inputDescontoFinanceiro.value = (Number(purchase.desconto_financeiro) || 0)
  .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  inputDescontoComercial.value = (Number(purchase.desconto_comercial) || 0)
  .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  inputStatus.value = purchase.status || "";

  // Carrega os itens da compra
  const itemsBody = modal.querySelector("#items-body-edit-modal") as HTMLTableSectionElement;
  itemsBody.innerHTML = "";

  const items = await getItemsByPurchaseIdAPI(id);
  originalItems = JSON.parse(JSON.stringify(items)); // Guarda os itens originais para a comparação

  items.forEach(item => {
    addItemRowTo(itemsBody, {
      produto_id: item.produto_id,
      produto_codigo: item.produto_codigo || "",
      produto_nome: item.produto_nome || "",
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      desconto_volume: item.desconto_volume || "0.00",
      valor_subtotal: item.valor_subtotal,
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

  const itemsBody = modal.querySelector("#items-body-edit-modal") as HTMLElement;
  const itemRows = Array.from(itemsBody.querySelectorAll("tr"));

  const isEditing = itemRows.some(row => row.dataset.status !== "salvo");
  if (isEditing) {
    await showMessage("Obrigatório salvar todos os itens antes de salvar a compra.");
    return;
  }

  const formData = new FormData(form);
  const currentItems = await collectPurchaseItems(itemsBody);

  const updatedPurchaseData: Partial<any> = {};

  // Helpers
  const parseString = (value: FormDataEntryValue | null) => 
    value && value.toString().trim() !== "" ? value.toString() : null;

  const parseNumber = (value: FormDataEntryValue | null) => 
    value ? Number(value.toString().replace(",", ".")) : null;
    
  //Cabeçalho: compara com originalFormData, pra depois enviar no corpo da requisição só o que foi alterado, evita ficar reenviando todas as informações toda vez.
  const fornecedor_id = parseNumber(formData.get("edit-fornecedor-id"));
  if (fornecedor_id !== null && fornecedor_id !== Number(originalFormData["edit-fornecedor-id"])) {
    updatedPurchaseData.fornecedor_id = fornecedor_id;
  }

  const data_emissao = parseString(formData.get("edit-data-emissao"));
  if (data_emissao !== originalFormData["edit-data-emissao"]) updatedPurchaseData.data_emissao = data_emissao;

  const tipo_pagamento = parseString(formData.get("edit-tipo-pagamento"));
  if (tipo_pagamento !== originalFormData["edit-tipo-pagamento"]) updatedPurchaseData.tipo_pagamento = tipo_pagamento;

  const desconto_financeiro = parseNumber(formData.get("edit-desconto-financeiro")) ?? 0;
  if (desconto_financeiro !== Number(originalFormData["edit-desconto-financeiro"] ?? 0)) updatedPurchaseData.desconto_financeiro = desconto_financeiro;

  const desconto_comercial = parseNumber(formData.get("edit-desconto-comercial")) ?? 0;
  if (desconto_comercial !== Number(originalFormData["edit-desconto-comercial"] ?? 0)) updatedPurchaseData.desconto_comercial = desconto_comercial;

  const status = parseString(formData.get("edit-status"));
  if (status !== originalFormData["edit-status"]) updatedPurchaseData.status = status;

  // Itens da compra: adiciona apenas se houver alteração
  const changedItems = currentItems.filter((item, i) => {
    const original = originalItems[i];
    return !original || JSON.stringify(item) !== JSON.stringify(original);
  });
  if (changedItems.length > 0) updatedPurchaseData.itens = changedItems;

    if (fornecedor_id === null) {
      showMessage("Selecione um fornecedor válido.");
      return;
    }

  try {
  // Envia dados do cabeçalho + itens juntos.
  const response = await updatePurchaseAPI(currentEditId, updatedPurchaseData);

  if (!response.ok) {
  await showMessage(response.message || "Erro inesperado ao salvar compra.");
  return;
}

await showMessage("Compra atualizada com sucesso.");

  modal.classList.add("hidden");

  // garante que a lista vai ser recarregada com os dados atualizados
  const purchases = await loadPurchasesAPI();
  renderPurchasesList(purchases);

} catch (err: any) {
  await showMessage(err?.message || "Erro de conexão com o servidor.");
}});