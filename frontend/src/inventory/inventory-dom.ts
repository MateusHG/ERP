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

  tbody.innerHTML = "";

  const statusCells: Array<{ td: HTMLTableCellElement; title?: string; color?: string }> = [];

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

     // === Coluna Status === //
    const tdStatus = document.createElement("td");
    const iconPlaceholder = document.createElement("span"); 
    iconPlaceholder.setAttribute("data-lucide", "check-circle");
    iconPlaceholder.className = "status-icon-placeholder";

    const estoqueAtual = inventoryItem.estoque_atual ?? 0;
    const min = inventoryItem.estoque_minimo ?? 0;
    const max = inventoryItem.estoque_maximo ?? 0;

    let title: string | undefined;
    let color: string | undefined;
    
    if (estoqueAtual < min) {
      iconPlaceholder.setAttribute("data-lucide", "alert-circle");
      title = "Estoque abaixo do mínimo definido";
      color = "#e57373";
    
    } else if (estoqueAtual > max) {
      iconPlaceholder.setAttribute("data-lucide", "alert-triangle");
      title = "Estoque acima do máximo definido";
      color = "#ffb74d";
    
    } else {
      iconPlaceholder.setAttribute("data-lucide", "check-circle");
      title = "Estoque dentro do intervalo definido";
      color = "#81c784";
    }

    tdStatus.appendChild(iconPlaceholder);
    statusCells.push({ td: tdStatus, title, color });

    tr.appendChild(tdStatus);

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

  // Renderiza os ícones do Lucide (Status dos Itens)
  // @ts-ignore
  lucide.createIcons();

  statusCells.forEach(({ td, title, color }) => {
  if (!td) return;
  const svg = td.querySelector("svg");
  if (!svg) return;

  if (title) {
    td.setAttribute("title", title);
    svg.setAttribute("aria-label", title);
  }

  svg.classList.add("status-icon");
  if (color) (svg as SVGElement).style.color = color;
  (svg as SVGElement).style.cursor = "help";
  (svg as SVGElement).style.verticalAlign = "middle";
  svg.style.transition = "transform 0.12s ease";

  svg.addEventListener("mouseenter", () => (svg.style.transform = "scale(1.08)"));
  svg.addEventListener("mouseleave", () => (svg.style.transform = "scale(1)"));
});
};

// Pega os valores do campo de filtro.
  export function getFilterValues() {
    return {
      id: (document.querySelector('#filtro-id') as HTMLInputElement)?.value || "",
      codigo: (document.querySelector('#filtro-codigo') as HTMLInputElement)?.value || "",
      nome: (document.querySelector('#filtro-nome') as HTMLInputElement)?.value || "",
      categoria: (document.querySelector('#filtro-categoria') as HTMLInputElement)?.value || "",
      status: (document.querySelector('#filtro-status') as HTMLSelectElement)?.value || "",
      saldo: (document.querySelector('#filtro-saldo') as HTMLSelectElement)?.value || ""
    }
  };