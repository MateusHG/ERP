import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { showConfirm, showEstoqueNegativoMessage, showMessage } from "../utils/messages";
import { getItemsByPurchaseIdAPI, getPurchaseByIdAPI, loadPurchasesAPI, updatePurchaseAPI } from "./purchases-service";
import { getFilterValues, renderPurchasesList } from "./purchases-dom";
import { addItemRowTo } from "./purchase-item-dom";
import { setupSupplierAutoComplete } from "../utils/autocomplete";
import { updatePurchaseItemSummary } from "./purchase-item-summary";
import { updateTotalPurchaseDisplay } from "./purchase-summary";
import { collectPurchaseItems, lockPurchaseItems, unlockPurchaseItems } from "./purchase-items-controller";
import { getCurrentMonthDateRange } from "../utils/formatters";

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

  unlockPurchaseFormFields(form);

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

  // ---------------------------------------------------------------------
  // 1. Carrega os itens da compra
  // ---------------------------------------------------------------------
  const itemsBody = modal.querySelector("#items-body-edit-modal") as HTMLTableSectionElement;
  unlockPurchaseItems(itemsBody);

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

  // Bloqueio: Caso o status da compra for entregue/finalizado, desabilita a edição dos dados.
  function lockPurchaseFormFields(form: HTMLFormElement, helperMessage: string) {
    const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");
    fields.forEach(field => {
      if (field.name === "edit-status") return;

      if (field instanceof HTMLInputElement) {
        field.readOnly = true;
      
      } else if (field instanceof HTMLSelectElement) {
        field.dataset.locked = "true";
        field.style.pointerEvents = "none";
        field.style.background = "#f5f5f5";
        field.style.color = "#777";
        return;
      }

        field.title = helperMessage;
        field.style.cursor = "not-allowed";
    });
  }

  function unlockPurchaseFormFields(form: HTMLFormElement) {
    const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");

    fields.forEach(field => {
      if (field.name === "edit-id") return;

      const lockedReadOnlyFields = [
        "desconto-itens",
        "descontos-totais",
        "valor-bruto",
        "valor-total"
      ];

      if (lockedReadOnlyFields.includes(field.name)) {
        if (field instanceof HTMLInputElement) {
          field.readOnly = true;
          field.style.cursor = "not-allowed";
        }
        field.title = "Campo de visualização - calculado automaticamente.";
        return;
      }

      if (field instanceof HTMLInputElement) {
        field.readOnly = false;
        field.style.cursor = "text";
      
      } else if (field instanceof HTMLSelectElement) {
        field.dataset.locked = "false";
        field.style.pointerEvents = "auto";
        field.style.background = "";
        field.style.color = "";
      }

      field.title = "";
    });
  }

  const lockedStatuses = ["entregue", "finalizado"];
  if (lockedStatuses.includes(purchase.status)) {
    const headerHelper = "Compra recebida/finalizada - Reabra para editar.";
    const itemHelper = "Itens não podem ser alterados em compras com status Recebido ou Finalizado.";

    lockPurchaseFormFields(form, headerHelper);
    lockPurchaseItems(itemsBody, itemHelper);
  }

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
    // =========================
    // Validação de status
    // =========================
    const previousStatus = originalFormData["edit-status"]?.toLowerCase();
    const currentStatus = (updatedPurchaseData.status || previousStatus)?.toLowerCase();

    const statusFinalized = ["recebido", "finalizado"];
    const statusOpen = ["aberto", "aguardando", "aprovado", "cancelado"];

    const wasFinalized = statusFinalized.includes(previousStatus);
    const isFinalized = statusFinalized.includes(currentStatus);

    const wasOpen = statusOpen.includes(previousStatus);
    const isOpen = statusOpen.includes(currentStatus);

    // Ignora transição entre status "recebido" e "finalizado"(Não movimenta estoque).
    const isInternalTransition = 
      statusFinalized.includes(previousStatus) &&
      statusFinalized.includes(currentStatus);

    if (!isInternalTransition) {
      if (wasOpen && isFinalized) {
        const confirmed = await showConfirm(
          "<b>🛑 Atenção! 🛑</b><br><br>" +
          "Alterar o status para <b>'Finalizado'</b> ou <b>'Recebido'</b> fará o sistema <b>dar entrada no estoque.</b><br><br>" +
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

      if (wasFinalized && isOpen) {
        const confirmed = await showConfirm(
          "<b>🛑 Atenção! 🛑</b><br><br>" +
          "<b>Esta compra já movimentou o estoque.</b><br><br>" +
          "Ao alterar o status, o sistema irá <b>reverter a movimentação</b>.<br><br>" +
          "<b>Deseja realmente continuar?</b>"
        );

        if (!confirmed) {
          await showMessage(
            "<b>Operação cancelada ✅</b><br><br>" +
            "- Estoque não foi alterado."
          );
          return;
        }
      }
    }

// =========================================
// Envia dados do cabeçalho + itens
// =======================================
try {
  const response = await updatePurchaseAPI(currentEditId, updatedPurchaseData);

  await showMessage("Compra atualizada com sucesso.");
  
  const currentFilters = getFilterValues();
  if (!currentFilters.data_emissao_inicio || !currentFilters.data_emissao_final) {
    const { start, end } = getCurrentMonthDateRange();
    currentFilters.data_emissao_inicio = start;
    currentFilters.data_emissao_final = end;
  }

  const purchases = await loadPurchasesAPI();
  renderPurchasesList(purchases);

   modal.classList.add("hidden");
   return;
} catch (error: any) {

  const errData = error?.responseData || null;

  const produtosNegativos = 
    errData?.detalhes?.produtos ||
    errData?.detalhes?.itens ||
    errData?.produtos ||
    errData?.itens ||
    errData?.inconsistencies ||
    null;

  if (produtosNegativos && Array.isArray(produtosNegativos)) {
    showEstoqueNegativoMessage(produtosNegativos);
    return;
  }

  // Outros erros genéricos
  await showMessage(errData?.message || error?.message || "Erro inesperado ao salvar compra.");
  return;
}
  

} catch (err: any) {
  await showMessage(err?.message || "Erro interno no servidor.");
  return;
}});