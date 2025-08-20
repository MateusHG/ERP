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
    btnEdit.className = "btn-edit";
    btnEdit.textContent = "✏️";
    btnEdit.dataset.id = purchase.id.toString();

    const btnDelete = document.createElement("button");
    btnDelete.className = "btn-delete";
    btnDelete.textContent = "❌";
    btnDelete.dataset.id = purchase.id.toString();

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);
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
    