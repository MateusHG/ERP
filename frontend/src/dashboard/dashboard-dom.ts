import { formatCurrency } from "../utils/formatters";

export function updateDashboardCards(data: any) {
  
   // ========== VENDAS ==============
  document.getElementById("total-sales-value")!.textContent =
    formatCurrency(data.total_vendas_finalizadas_valores);

  document.getElementById("total-sales-count")!.textContent =
    `Finalizadas: ${data.total_vendas_finalizadas ?? 0}`;

  document.getElementById("total-sales-pending")!.textContent =
    `Pendentes: ${data.total_vendas_pendentes ?? 0}`;

  document.getElementById("sales-insight")!.textContent =
    `Aprovações pendentes: ${data.total_vendas_aguardando_aprovacao ?? 0}`;


   // ========== COMPRAS ==============
  document.getElementById("total-purchases-value")!.textContent =
    formatCurrency(data.total_compras_finalizadas_valores);

  document.getElementById("total-purchases-count")!.textContent =
    `Finalizadas: ${data.total_compras_finalizadas ?? 0}`;

  document.getElementById("total-purchases-pending")!.textContent =
    `Pendentes: ${data.total_compras_pendentes ?? 0}`;

  document.getElementById("purchases-insight")!.textContent =
    `Aguardando aprovação: ${data.total_compras_aguardando_aprovacao ?? 0}`;


// ========== ESTOQUE ========================================================
  document.getElementById("below-minimum")!.textContent =
    data.produtos_estoque_baixo ?? 0;

  document.getElementById("inventory-insight")!.textContent =
    `Médio: ${data.produtos_estoque_medio} • Alto: ${data.produtos_estoque_alto}`;




// ========== CLIENTES ==============
  document.getElementById("active-customers")!.textContent = data.clientes_ativos ?? 0;

  document.getElementById("new-monthly-customers")!.textContent =
    `Novos no mês: ${data.clientes_novos_mes ?? 0}`;

  document.getElementById("customers-insight")!.textContent =
    `Inativos: ${data.clientes_inativos ?? 0}`;


   // ========== FORNECEDORES ==============
  document.getElementById("active-suppliers")!.textContent = data.fornecedores_ativos ?? 0;

  document.getElementById("inactive-suppliers")!.textContent =
    `Inativos: ${data.fornecedores_inativos ?? 0}`;

  document.getElementById("suppliers-insight")!.textContent =
    `Novos no mês: ${data.fornecedores_novos_mes ?? 0}`;
};