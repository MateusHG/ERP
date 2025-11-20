import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { setupCustomerAutoComplete } from "../utils/autocomplete";
import { addItemRowTo } from "./sale-item-dom";
import { getItemsBySaleIdAPI, getSaleByIdAPI, searchSalesWithFilterAPI, updateSaleAPI } from "./sales-service";
import { showConfirm, showEstoqueNegativoMessage, showMessage } from "../utils/messages";
import { getFilterValues, renderSalesList } from "./sales-dom";
import { updateSaleItemSummary } from "./sale-item-summary";
import { updateTotalSaleDisplay } from "./sale-summary";
import { collectSaleItems } from "./sale-items-controller";
import { getCurrentMonthDateRange, parseNumber, parseString } from "../utils/formatters";
import { lockFormFields, lockItemRows, unlockFormFields, unlockItemRows } from "../utils/form-locks";
import { setViewMode } from "../sales/sale-items-controller";

const modal = document.getElementById("edit-modal")!;
const form = document.getElementById("edit-form")! as HTMLFormElement;
const cancelBtn = document.getElementById("cancel-edit");

// Seleciona os inputs dentro do modal de edição;
const inputClienteSearch = modal.querySelector<HTMLInputElement>('#cliente-search')!;
const inputClienteId = modal.querySelector<HTMLInputElement>('#cliente-id')!;
const suggestions = modal.querySelector<HTMLUListElement>('#cliente-suggestions')!;

setupCustomerAutoComplete(inputClienteSearch, inputClienteId, suggestions);

let currentEditId: number | null = null;
let originalFormData: Record<string, string> = {};
let originalItems: any[] = [];

// --------------------------------------------------------------------------------------------------

export async function openEditModal(id: number) {
  currentEditId = id;

  const sale = await getSaleByIdAPI(id);

  document.getElementById("edit-sale-id")!.textContent = String(sale.id);

  inputClienteSearch.value = sale.cliente_nome || "";
  inputClienteId.value = String(sale.cliente_id || "");

  const inputDataEmissao = modal.querySelector<HTMLInputElement>('input[name="edit-data-emissao"]')!;
  const inputTipoPagamento = modal.querySelector<HTMLSelectElement>('select[name="edit-tipo-pagamento"]')!;
  const inputDescontoFinanceiro = modal.querySelector<HTMLInputElement>('input[name="edit-desconto-financeiro"]')!;
  const inputDescontoComercial = modal.querySelector<HTMLInputElement>('input[name="edit-desconto-comercial"]')!;
  const inputStatus = modal.querySelector<HTMLSelectElement>('select[name="edit-status"]')!;

  inputDataEmissao.value = sale.data_emissao ? sale.data_emissao.split("T")[0] : "";
  inputTipoPagamento.value = sale.tipo_pagamento || "";

  inputDescontoFinanceiro.value = (Number(sale.desconto_financeiro) || 0)
  .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  inputDescontoComercial.value = (Number(sale.desconto_comercial) || 0)
  .toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  inputStatus.value = sale.status || "";


  // ---------------------------------------------------------------------
  // 1. Carrega os itens da venda
  // ---------------------------------------------------------------------
  const itemsBody = modal.querySelector('#items-body-edit-modal') as HTMLTableSectionElement;
  
  itemsBody.innerHTML = "";

  const items = await getItemsBySaleIdAPI(id);
  originalItems = JSON.parse(JSON.stringify(items)); // Guarda os itens originais para comparação.
  
  items.forEach(item => {
    const row = addItemRowTo(itemsBody, {
      id: item.id,
      produto_id: item.produto_id,
      produto_codigo: item.produto_codigo || "",
      produto_nome: item.produto_nome || "",
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      desconto_volume: item.desconto_volume || "0.00",
      valor_subtotal: item.valor_subtotal,
    }, "edit", true); // prefixo = "edit", isSaved = true

    setViewMode(row, true);
  });

  updateSaleItemSummary(itemsBody, "edit");
  updateTotalSaleDisplay("edit");

  // ---------------------------------------------------------------------
  // 3. Travar ou destravar campos dependendo do status da venda
  // ---------------------------------------------------------------------
  const lockedStatuses = ["entregue", "finalizado"];

  if (lockedStatuses.includes(sale.status)) {
     lockFormFields(
      form,
      "Venda entregue/finalizada - Reabra a venda para editar.",
      {
        allowNames: ["edit-status"]
      }
    );

    // Trava apenas os itens
    lockItemRows(
      itemsBody,
      "Itens bloqueados - venda entregue/finalizada - reabra para editar.",
      {
        addButtonSelector: "#add-item-edit-modal"
      }
    );

  } else {
    // Libera o formulário 
    unlockFormFields(form, {
      readOnlyNames: [
        "desconto-itens",
        "descontos-totais",
        "valor-bruto",
        "valor-total"
      ]
    });
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

  const itemsBody = modal.querySelector('#items-body-edit-modal') as HTMLElement;
  const itemRows = Array.from(itemsBody.querySelectorAll('tr'));

  const isEditing = itemRows.some(row => row.dataset.status !== "salvo");
  if (isEditing) {
    await showMessage("Obrigatório salvar todos os itens antes de salvar a venda.");
    return;
  }

  const formData = new FormData(form);
  const currentItems = await collectSaleItems(itemsBody);

  const updatedSaleData: Partial<any> = {};

  // Cabeçalho: compara com originalFormData, para depois enviar no corpo da requisição só o que foi alterado, evita reenviar todas as informações toda vez.
  const cliente_id = parseNumber(formData.get("edit-cliente-id"));
  if (cliente_id !== null && cliente_id !== Number(originalFormData["edit-cliente-id"])) {
    updatedSaleData.cliente_id = cliente_id;
  }

  const data_emissao = parseString(formData.get("edit-data-emissao"));
  if (data_emissao !== originalFormData["edit-data-emissao"]) updatedSaleData.data_emissao = data_emissao;

  const tipo_pagamento = parseString(formData.get("edit-tipo-pagamento"));
  if (tipo_pagamento !== originalFormData["edit-tipo-pagamento"]) updatedSaleData.tipo_pagamento = tipo_pagamento;

  const desconto_financeiro = parseNumber(formData.get("edit-desconto-financeiro")) ?? 0;
  if (desconto_financeiro !== Number(originalFormData["edit-desconto-financeiro"] ?? 0)) updatedSaleData.desconto_financeiro = desconto_financeiro;

  const desconto_comercial = parseNumber(formData.get("edit-desconto-comercial")) ?? 0;
  if (desconto_comercial !== Number(originalFormData["edit-desconto-comercial"] ?? 0)) updatedSaleData.desconto_comercial = desconto_comercial;

  const status = parseString(formData.get("edit-status"));
  if (status !== originalFormData["edit-status"]) updatedSaleData.status = status;

  // Itens da venda: adiciona apenas se houver alteração
  
  // Normaliza os itens atuais(garante o ID de reconhecimento único do item)
  const normalizedCurrentItems = currentItems.map(item => ({
    id: item.id ?? null,
    produto_id: item.produto_id,
    quantidade: item.quantidade,
    preco_unitario: item.preco_unitario,
    desconto_volume: item.desconto_volume ?? 0,
    valor_subtotal: item.valor_subtotal ?? 0
  }));

  // Normaliza os itens orginais para comparação
  const normalizedOriginalItems = originalItems.map(item => ({
    id: item.id ?? null,
    produto_id: item.produto_id,
    produto_quantidade: item.quantidade,
    preco_unitario: item.preco_unitario,
    desconto_volume: item.desconto_volume ?? 0,
    valor_subtotal: item.valor_subtotal ?? 0
  }));

  // Detecta itens alterados
  const changedItems = normalizedCurrentItems.filter((item, index) => {
    const original = normalizedOriginalItems[index];
    return !original || JSON.stringify(item) !== JSON.stringify(original);
  });

  if (changedItems.length > 0) {
    updatedSaleData.itens = changedItems;
  }

  if (cliente_id === null) {
    showMessage('Selecione um cliente válido.');
    return;
  }

  try {
  // =========================
  // Validação de status
  // =========================
  const previousStatus = originalFormData["edit-status"]?.toLowerCase();
  const currentStatus = (updatedSaleData.status || previousStatus)?.toLowerCase();

  const statusesFinalized = ["finalizado", "entregue"];
  const statusesOpen = ["aberto", "aguardando", "aprovado", "despachado", "cancelado"];

  const wasFinalized = statusesFinalized.includes(previousStatus);
  const isFinalized = statusesFinalized.includes(currentStatus);

  const wasOpen = statusesOpen.includes(previousStatus);
  const isOpen = statusesOpen.includes(currentStatus);

  // Ignora transição entre status "entregue" e "finalizado"(Não movimenta estoque).
  const isInternalTransition =
    statusesFinalized.includes(previousStatus) &&
    statusesFinalized.includes(currentStatus);

  if (!isInternalTransition) {

    // Abrir → Finalizado/Entregue (movimenta estoque)
    if (wasOpen && isFinalized) {
      const confirmed = await showConfirm(
        "<b>🛑 Atenção! 🛑</b><br><br>" +
        "Alterar o status para <b>'Finalizado'</b> ou <b>'Entregue'</b> fará o sistema <b>dar saída no estoque.</b><br><br>" +
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

    // Finalizado/Entregue → Aberto (reverte movimentação)
    if (wasFinalized && isOpen) {
      const confirmed = await showConfirm(
        "<b>🛑 Atenção! 🛑</b><br><br>" +
        "<b>Esta venda já movimentou o estoque.</b><br><br>" +
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
  const response = await updateSaleAPI(currentEditId, updatedSaleData);

  // Se chegou aqui, deu certo — segue com o fluxo de sucesso
  await showMessage("Venda atualizada com sucesso.");

  const currentFilters = getFilterValues();
  if (!currentFilters.data_emissao_inicio || !currentFilters.data_emissao_final) {
    const { start, end } = getCurrentMonthDateRange();
    currentFilters.data_emissao_inicio = start;
    currentFilters.data_emissao_final = end;
  }

  const sales = await searchSalesWithFilterAPI(currentFilters);
  renderSalesList(sales);

  modal.classList.add("hidden");
  return;
} catch (error: any) {

  console.log("Erro do back-end:", error);
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
  await showMessage(errData?.message || error?.message || "Erro inesperado ao salvar venda.");
  return;
}

} catch (error: any) {
  console.error("Erro inesperado no bloco de validação", error);
  await showMessage("Erro inesperado ao processar venda.");
  return;
}});