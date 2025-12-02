import { paymentLabels, purchaseModel, statusLabels } from "./purchase-model";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatCurrency, formatData, getCurrentMonthDateRange } from "../utils/formatters";
import { searchPurchasesWithFilterAPI } from "./purchases-service";

//Navegação entre os módulos
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

export function renderPurchasesList(purchases: purchaseModel[]): void {
  const tbody = document.getElementById("purchases-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = ""

  purchases.forEach(purchase => {

    const tr = document.createElement("tr");

    const textCell = (value: string | number | null | undefined): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = value ? String(value): "-"
      return td;
    };

    tr.appendChild(textCell(formatData(purchase.data_emissao)));
    tr.appendChild(textCell(purchase.id));
    tr.appendChild(textCell(purchase.fornecedor_nome || purchase.fornecedor_id));
    tr.appendChild(textCell(paymentLabels[purchase.tipo_pagamento] || purchase.tipo_pagamento));
    tr.appendChild(textCell(formatCurrency(purchase.desconto_comercial ?? 0)));
    tr.appendChild(textCell(formatCurrency(purchase.desconto_financeiro ?? 0)));
    tr.appendChild(textCell(formatCurrency(purchase.valor_bruto ?? 0)));
    tr.appendChild(textCell(formatCurrency(purchase.valor_total ?? 0)));
    tr.appendChild(textCell(statusLabels[purchase.status] || purchase.status));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.dataset.id = purchase.id.toString();
    btnEdit.className = "btn-edit";
    btnEdit.innerHTML = `<img src="/erpicons/edit-file.svg" alt="Editar Produto" class="icon-btn" />`;
    btnEdit.title = "Clique para editar esta compra";
    tdActions.appendChild(btnEdit);

    const status = purchase.status;
    const isLocked = status === "finalizado" || status === "recebido";

    // Se não estiver finalizado, mostra o botão de deletar normalmente.
    if (!isLocked) {
      const btnDelete = document.createElement("button");
      btnDelete.dataset.id = purchase.id.toString();
      btnDelete.className = "btn-delete";
      btnDelete.innerHTML = `<img src="/erpicons/delete.svg" alt="Editar Produto" class="icon-btn" />`;
      btnDelete.title = "Clique para deletar esta compra";
      tdActions.appendChild(btnDelete);
    } else {
      // Caso esteja finalizada, bloqueia o botão de delete.
      const btnLocked = document.createElement("button");
      btnLocked.className = "btn-delete disabled-delete";
      btnLocked.disabled = true;
      btnLocked.innerHTML = `<img src="/erpicons/delete.svg" alt="Editar Produto" class="icon-btn" />`;
      btnLocked.title = "Compra recebida/finalizada - exclusão bloqueada";
      tdActions.appendChild(btnLocked);
    } 

    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });
};

//Pega os valores dos campos de filtro.
export function getFilterValues() {
  return {
    id: (document.querySelector("#filtro-id") as HTMLInputElement)?.value || "",
    fornecedor_nome: (document.querySelector("#filtro-nome-fornecedor") as HTMLInputElement)?.value || "",
    status: (document.querySelector("#filtro-status") as HTMLSelectElement)?.value || "",
    data_emissao_inicio: (document.querySelector('#initial-date') as HTMLInputElement)?.value || "",
    data_emissao_final: (document.querySelector('#final-date') as HTMLInputElement)?.value || "",
  };
};

window.addEventListener('DOMContentLoaded', async () => {
  const initialDateInput = document.getElementById("initial-date") as HTMLInputElement;
  const finalDateInput = document.getElementById("final-date") as HTMLInputElement;
  const filterBtn = document.getElementById("filter-btn") as HTMLInputElement;

  const { start, end } = getCurrentMonthDateRange();

  if (initialDateInput && finalDateInput) {
    initialDateInput.value = start;
    finalDateInput.value = end;
  }

  const initialFilters = getFilterValues();
  initialFilters.data_emissao_inicio = start;
  initialFilters.data_emissao_final = end;

  const purchases = await searchPurchasesWithFilterAPI(initialFilters);
  renderPurchasesList(purchases);

  filterBtn?.addEventListener('click', async () => {
      const filters = getFilterValues();
      const purchases = await searchPurchasesWithFilterAPI(filters);
      renderPurchasesList(purchases)
  });
});
    