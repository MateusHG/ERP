import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatCurrency, getCurrentMonthDateRange } from "../utils/formatters";
import { authorizedFetch } from "../utils/fetch-helper";

async function loadDashboardWithFilter(dataInicial: string, dataFinal: string) {
  try {
    const response = await authorizedFetch(
      `https://localhost:3000/api/dashboard?data_inicial=${dataInicial}&data_final=${dataFinal}`,
      {
        method: "GET"
      }
    );

    const data = await response.json();

    // ========== Vendas ==============
    (document.getElementById('total-sales-count') as HTMLElement).textContent = `Finalizadas: ${data.total_vendas_finalizadas ?? 0}`;
    (document.getElementById('total-sales-value') as HTMLElement).textContent = `Total: ${formatCurrency(data.total_vendas_finalizadas_valores)}`;
    (document.getElementById('total-sales-pending') as HTMLElement).textContent = `Vendas Pendentes: ${data.total_vendas_pendentes}`;


    // ========== Compras ==============
    (document.getElementById('total-purchases-count') as HTMLElement).textContent = `Finalizadas: ${data.total_compras_finalizadas ?? 0}`;
    (document.getElementById('total-purchases-value') as HTMLElement).textContent = `Total: ${formatCurrency(data.total_compras_valores)}`;
    (document.getElementById('total-purchases-pending') as HTMLElement).textContent = `Compras Pendentes: ${data.total_compras_pendentes}`;


    // ========== Estoque ==============
    (document.getElementById('below-minimum') as HTMLElement).textContent = data.produtos_estoque_baixo;
    (document.getElementById('between-limits') as HTMLElement).textContent = data.produtos_estoque_medio;
    (document.getElementById('above-maximum') as HTMLElement).textContent = data.produtos_estoque_alto;


    // ========== Clientes ==============
    (document.getElementById('active-customers') as HTMLElement).textContent = data.clientes_ativos;
    (document.getElementById('inactive-customers') as HTMLElement).textContent = data.clientes_inativos;
    (document.getElementById('new-monthly-customers') as HTMLElement).textContent = data.clientes_novos_mes;

    // ========== Fornecedores ==============
    (document.getElementById('active-suppliers') as HTMLElement).textContent = data.fornecedores_ativos;
    (document.getElementById('inactive-suppliers') as HTMLElement).textContent = data.fornecedores_inativos;
    (document.getElementById('new-monthly-suppliers') as HTMLElement).textContent = data.fornecedores_novos_mes;
  
  } catch (err) {
    console.error('Erro ao carregar os dados do Dashboard:', err);
  }
}

// ==========================
// DOM carregado
// ==========================
window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

  const initialDateInput = document.getElementById('initial-date') as HTMLInputElement;
  const finalDateInput = document.getElementById('final-date') as HTMLInputElement;
  const filterBtn = document.getElementById('filter-btn') as HTMLButtonElement;

  const { start, end } = getCurrentMonthDateRange();

//Preenche os inputs do filtro de data.
if (initialDateInput && finalDateInput) {
  initialDateInput.value = start;
  finalDateInput.value = end;
}

// Primeira chamada com as datas padrão do mês atual
await loadDashboardWithFilter(start, end);

//Clique no botão filtrar.
if (filterBtn) {
  filterBtn.addEventListener('click', async () => {
    const newInitialDate = initialDateInput.value;
    const newFinalDate = finalDateInput.value;
    await loadDashboardWithFilter(newInitialDate, newFinalDate);
  });
};

