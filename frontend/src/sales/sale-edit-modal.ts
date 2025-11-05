import { getFormDataSnapshot, isFormChanged } from "../utils/validations";
import { setupCustomerAutoComplete } from "../utils/autocomplete";
import { addItemRowTo } from "./sale-item-dom";
import { getItemsBySaleIdAPI, getSaleByIdAPI, loadSalesAPI, searchSalesWithFilterAPI, updateSaleAPI } from "./sales-service";
import { showConfirm, showMessage } from "../utils/messages";
import { getFilterValues, renderSalesList } from "./sales-dom";
import { updateSaleItemSummary } from "./sale-item-summary";
import { updateTotalSaleDisplay } from "./sale-summary";
import { collectSaleItems, lockSaleItems, unlockSaleItems } from "./sale-items-controller";
import { getCurrentMonthDateRange } from "../utils/formatters";

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

  unlockSaleFormFields(form);

  const sale = await getSaleByIdAPI(id);

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

  // Carrega os itens da venda;
  const itemsBody = modal.querySelector('#items-body-edit-modal') as HTMLTableSectionElement;
  unlockSaleItems(itemsBody);
  itemsBody.innerHTML = "";

  const items = await getItemsBySaleIdAPI(id);
  originalItems = JSON.parse(JSON.stringify(items)); // Guarda os itens originais para comparação.
  
  items.forEach(item => {
    addItemRowTo(itemsBody, {
      produto_id: item.produto_id,
      produto_codigo: item.produto_codigo || "",
      produto_nome: item.produto_nome || "",
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario,
      desconto_volume: item.desconto_volume || "0.00",
      valor_subtotal: item.valor_subtotal,
    }, "edit", true); // prefixo = "edit", isSaved = true
  });

  updateSaleItemSummary(itemsBody, "edit");
  updateTotalSaleDisplay("edit");

  // Bloqueio: Caso o status da venda for entregue/finalizado, desabilita a edição dos dados.
  function lockSaleFormFields(form: HTMLFormElement, helperMessage: string) {
    const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");
    fields.forEach(field => {
      // Permite apenas alteração do status para o usuário poder reabrir a venda.
      if (field.name === "edit-status") return;

      if (field instanceof HTMLInputElement) {
        field.readOnly = true;

      } else if (field instanceof HTMLSelectElement) { 
      field.dataset.locked = "true";
      field.style.pointerEvents = "none";
      field.style.background = "#f5f5f5";
      field.style.color = "#777";
      return;
    };

      field.title = helperMessage;
      field.style.cursor = "not-allowed";
  });
}

  function unlockSaleFormFields(form: HTMLFormElement) {
    const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement>("input, select");

    fields.forEach(field => {
    // Reativa os campos, exceto o ID da venda (se existir)
      if (field.name === "edit-id") return;

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
  if (lockedStatuses.includes(sale.status)) {
    const headerHelper = "Venda entregue/finalizada - Reabra a venda para editar.";
    const itemHelper = "Itens não podem ser alterados em vendas com status Entregue ou Finalizado.";

    lockSaleFormFields(form, headerHelper);
    lockSaleItems(itemsBody, itemHelper);
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

  // Helpers
  const parseString = (value: FormDataEntryValue | null) => 
    value && value.toString().trim() !== "" ? value.toString() : null;

  const parseNumber = (value: FormDataEntryValue | null) => 
    value ? Number(value.toString().replace(",", ".")) : null;

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
  const changedItems = currentItems.filter((item, i) => {
    const original = originalItems[i];
    return !original || JSON.stringify(item) !== JSON.stringify(original);
  });
  if (changedItems.length > 0) updatedSaleData.itens = changedItems;

  if (cliente_id === null) {
    showMessage('Selecione um cliente válido.');
    return;
  }

  try {
    // Envia dados do cabeçalho + itens juntos.
    const response = await updateSaleAPI(currentEditId, updatedSaleData);

    if (!response.ok) {
      await showMessage(response.message || "Erro inesperado ao salvar venda.");
      return;
    }

    await showMessage("Venda atualizada com sucesso.");

    if (!["entregue", "finalizado"].includes(updatedSaleData.status || "")) {
    // Atualiza o status original para refletir o novo valor
    originalFormData["edit-status"] = updatedSaleData.status || "";

    const updatedSale = await getSaleByIdAPI(currentEditId);
    await openEditModal(updatedSale.id);
  }  

    const currentFilters = getFilterValues();
    if (!currentFilters.data_emissao_inicio || !currentFilters.data_emissao_final) {
      const { start, end } = getCurrentMonthDateRange();
      currentFilters.data_emissao_inicio = start;
      currentFilters.data_emissao_final = end;
}
  
    const sales = await searchSalesWithFilterAPI(currentFilters);
    renderSalesList(sales);

    modal.classList.add("hidden");

  } catch (err: any) {
    await showMessage(err?.message || "Erro de conexão com o servidor.");
  }
});
