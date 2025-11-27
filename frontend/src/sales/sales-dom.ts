import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatCurrency, formatData, getCurrentMonthDateRange } from "../utils/formatters";
import { saleModel, paymentLabels, statusLabels } from "./sale-model";
import { searchSalesWithFilterAPI } from "./sales-service";

window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

export function renderSalesList(sales: saleModel[]): void {
  const tbody = document.getElementById("sales-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = ""

  sales.forEach(sale => {
    const tr = document.createElement("tr");

    const textCell = (value: string | number | null | undefined): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = value ? String(value): "-"
      return td;
    };

    tr.appendChild(textCell(formatData(sale.data_emissao)));
    tr.appendChild(textCell(sale.id));
    tr.appendChild(textCell(sale.cliente_nome || sale.cliente_id));
    tr.appendChild(textCell(paymentLabels[sale.tipo_pagamento] || sale.tipo_pagamento));
    tr.appendChild(textCell(formatCurrency(sale.desconto_comercial ?? 0)));
    tr.appendChild(textCell(formatCurrency(sale.desconto_financeiro ?? 0)));
    tr.appendChild(textCell(formatCurrency(sale.valor_bruto ?? 0)));
    tr.appendChild(textCell(formatCurrency(sale.valor_total ?? 0)));
    tr.appendChild(textCell(statusLabels[sale.status] || sale.status));

    const tdActions = document.createElement("td");
    tdActions.className = "actions";

    const btnEdit = document.createElement("button");
    btnEdit.dataset.id = sale.id.toString();
    btnEdit.className = "btn-edit";
    btnEdit.innerHTML = `<img src="/erpicons/edit-file.svg" alt="Editar Produto" class="icon-btn" />`;
    btnEdit.title = "Clique para editar esta venda"

    const btnDelete = document.createElement("button");
    btnDelete.dataset.id = sale.id.toString();
    btnDelete.className = "btn-delete";
    btnDelete.innerHTML = `<img src="/erpicons/delete.svg" alt="Editar Produto" class="icon-btn" />`;
    btnDelete.title = "Clique para deletar esta venda"

    tdActions.appendChild(btnEdit);
    tdActions.appendChild(btnDelete);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
};

// Pega os valores dos campos de filtro.
export function getFilterValues() {
  return {
    id: (document.querySelector("#filtro-id") as HTMLInputElement)?.value || "",
    cliente_nome: (document.querySelector("#filtro-nome-cliente") as HTMLInputElement)?.value || "",
    status: (document.querySelector("#filtro-status") as HTMLSelectElement)?.value || "",
    data_emissao_inicio: (document.querySelector("#initial-date") as HTMLInputElement)?.value || "",
    data_emissao_final: (document.querySelector("#final-date") as HTMLInputElement)?.value || "",
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

  const sales = await searchSalesWithFilterAPI(initialFilters);
  renderSalesList(sales);

  filterBtn?.addEventListener("click", async () => {
    const filters = getFilterValues();
    const sales = await searchSalesWithFilterAPI(filters);
    renderSalesList(sales)
  });
});