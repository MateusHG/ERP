import { formatCurrency, formatData, formatDataAndTime } from "../utils/formatters";
import { getFilterValues, renderInventoryList } from "./inventory-dom";
import { listInventoryWithFilterAPI, loadInventoryMovements } from "./inventory-service";
import { openNewInventoryAdjustmentModal } from "./inventory-new-adjustment-modal";

//Chama o modal de novo ajuste de estoque.
export function handleNewAdjustmentClick(target: HTMLElement) {
  openNewInventoryAdjustmentModal();
};

// Função que cria dinamicamente o toggle de movimentações de um produto.
export async function toggleMovementsRow(productRow: HTMLTableRowElement, produtoId: number, produtoNome: string) {
  const nextRow = productRow.nextElementSibling as HTMLTableRowElement | null;

  if (nextRow?.classList.contains("movements-row") && nextRow.dataset.produtoId === String(produtoId)) {
    nextRow.remove(); // Recolhe a linha se já estiver aberta.
    return;
  }

  const trMov = document.createElement("tr");
  trMov.classList.add("movements-row");
  trMov.dataset.produtoId = String(produtoId);

  const tdMov = document.createElement("td");
  tdMov.colSpan = productRow.children.length;
  tdMov.innerHTML = `
    <div class="movements-container">
      <h4>Movimentações de ${produtoNome}</h4>
      <table class="movements-table">
        <thead>
          <tr>
            <th>Data e Horário</th>
            <th>Tipo</th>
            <th>Origem</th>
            <th>Saldo Anterior</th>
            <th>Qtd Movimentada</th>
            <th>Novo Saldo</th>
            <th>Preço Unitário</th>
            <th>Total</th>
            <th>Usuário</th>
          </tr>
        </thead>
        <tbody id="movements-body-${produtoId}">
          <tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>
        </tbody>
      </table>
    </div>
  `;

  trMov.appendChild(tdMov);
  productRow.insertAdjacentElement("afterend", trMov);

  const movimentacoes = await loadInventoryMovements(produtoId);

  const tbodyMov = document.getElementById(`movements-body-${produtoId}`);
  if (!tbodyMov) return;

  tbodyMov.innerHTML = movimentacoes.length
  ? movimentacoes.map((m: any) => `
   <tr>
          <td>${m.created_at ? formatDataAndTime(m.created_at) : "-"}</td>
          <td>${m.tipo || "-"}</td>
          <td>${m.origem ?? "-"}</td>
          <td>${m.saldo_anterior ?? "-"}</td>
          <td>${m.qtd_movimentada ?? "-"}</td>
          <td>${m.saldo_posterior ?? "-"}</td>
          <td>${m.valor_unitario ? formatCurrency(m.valor_unitario) : "-"}</td>
          <td>${m.valor_unitario ? formatCurrency(m.total) : "-"}</td>
          <td>${m.usuario || "-"}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="5" style="text-align:center;">Nenhuma movimentação encontrada.</td></tr>`;
};

export async function handleFilterChange() {
  const filters = getFilterValues();
  const items = await listInventoryWithFilterAPI(filters);
  renderInventoryList(items);
};