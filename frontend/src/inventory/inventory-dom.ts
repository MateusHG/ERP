import { authorizedFetch } from "../utils/fetch-helper";
import { formatCurrency } from "../utils/formatters";
import { initHeaderData, initLogout, initNavigation } from "../utils/navigation"
import { inventoryListModel } from "./inventory-model";

window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

export function renderInventoryList(inventoryItems: inventoryListModel[]): void {
  const tbody = document.getElementById("inventory-tbody") as HTMLTableSectionElement | null;
  if (!tbody) return;

  tbody.innerHTML = ""

  inventoryItems.forEach(inventoryItem => {
    const tr = document.createElement("tr");

    const textCell = (value: string | number | null | undefined): HTMLTableCellElement => {
      const td = document.createElement("td");
      td.textContent = String(value ?? "-");
      return td;
    };

    tr.appendChild(textCell(inventoryItem.id));
    tr.appendChild(textCell(inventoryItem.codigo));
    tr.appendChild(textCell(inventoryItem.produto_nome));
    tr.appendChild(textCell(inventoryItem.categoria));
    tr.appendChild(textCell(inventoryItem.estoque_minimo));
    tr.appendChild(textCell(inventoryItem.estoque_maximo));
    tr.appendChild(textCell(inventoryItem.estoque_atual ?? 0));
    tr.appendChild(textCell(formatCurrency(inventoryItem.preco_medio_compra ?? 0)));
    tr.appendChild(textCell(formatCurrency(inventoryItem.preco_medio_venda ?? 0)));

    const tdActions = document.createElement("td");
    const btnView = document.createElement("button");
    btnView.className = "btn-view-movements";
    btnView.textContent = "Ver Movimentações";
    btnView.dataset.produtoId = String(inventoryItem.id);
    btnView.dataset.produtoNome = inventoryItem.produto_nome;

    tdActions.appendChild(btnView);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
};