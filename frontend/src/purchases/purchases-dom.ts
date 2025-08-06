import { purchaseModel } from "./purchase-model";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatCurrency, formatData } from "../utils/formatters";

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
    console.log(purchase);

    const tr = document.createElement("tr");

    const textCell = (value: string | number | null | undefined): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = value ? String(value): "-"
      return td;
    };

    tr.appendChild(textCell(formatData(purchase.data_emissao)));
    tr.appendChild(textCell(purchase.id));
    tr.appendChild(textCell(purchase.fornecedor_id));
    tr.appendChild(textCell(purchase.tipo_pagamento));
    tr.appendChild(textCell(formatCurrency(purchase.desconto_comercial)));
    tr.appendChild(textCell(formatCurrency(purchase.desconto_financeiro)));
    tr.appendChild(textCell(formatCurrency(purchase.valor_bruto)));
    tr.appendChild(textCell(formatCurrency(purchase.valor_total)));
    tr.appendChild(textCell(purchase.status));

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
    fornecedor_id: (document.querySelector("#filtro-nome-fornecedor") as HTMLInputElement)?.value || "",
    status: (document.querySelector("#filtro-status") as HTMLSelectElement)?.value || "",
  };
};