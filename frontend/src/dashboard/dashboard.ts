import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatValues } from "../utils/formatters";
import { authorizedFetch } from "../utils/fetch-helper";

window.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initHeaderData();
  initLogout();
});

//Atualizar o dashboard ao clicar em filtrar.
async function loadDashboardWithFilter(dataInicial: string, dataFinal: string) {
  try {
    const response = await authorizedFetch(
      `http://localhost:3000/api/dashboard?data_inicial=${dataInicial}&data_final=${dataFinal}`,
      {
        method: "GET"
      }
    );

    const data = await response.json();

    //Preenche os cards com os dados da API.
    (document.getElementById('total-sales-count') as HTMLElement).textContent = `Finalizadas: ${data.total_vendas_finalizadas ?? 0}`;
    (document.getElementById('total-sales-value') as HTMLElement).textContent = `Total: ${formatValues(data.total_vendas_finalizadas_valores)}`;
    (document.getElementById('total-sales-pending') as HTMLElement).textContent = `Vendas Pendentes: ${data.total_vendas_pendentes}`;

    (document.getElementById('total-purchases-count') as HTMLElement).textContent = `Finalizadas: ${data.total_compras_finalizadas ?? 0}`;
    (document.getElementById('total-purchases-value') as HTMLElement).textContent = `Total: ${formatValues(data.total_compras_valores)}`;
    (document.getElementById('total-purchases-pending') as HTMLElement).textContent = `Compras Pendentes: ${data.total_compras_pendentes}`;

    (document.getElementById('below-minimum') as HTMLElement).textContent = data.produtos_estoque_baixo;
    (document.getElementById('between-limits') as HTMLElement).textContent = data.produtos_estoque_medio;
    (document.getElementById('above-maximum') as HTMLElement).textContent = data.produtos_estoque_alto;

    (document.getElementById('active-customers') as HTMLElement).textContent = data.clientes_ativos;
    (document.getElementById('inactive-customers') as HTMLElement).textContent = data.clientes_inativos;
    (document.getElementById('new-monthly-customers') as HTMLElement).textContent = data.clientes_novos_mes;


    (document.getElementById('active-suppliers') as HTMLElement).textContent = data.fornecedores_ativos;
    (document.getElementById('inactive-suppliers') as HTMLElement).textContent = data.fornecedores_inativos;
    (document.getElementById('new-monthly-suppliers') as HTMLElement).textContent = data.fornecedores_novos_mes;
  
  } catch (err) {
    console.error('Erro ao carregar os dados do Dashboard:', err);
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  const initialDateInput = document.getElementById('initial-date') as HTMLInputElement;
  const finalDateInput = document.getElementById('final-date') as HTMLInputElement;
  const filterBtn = document.getElementById('filter-btn') as HTMLButtonElement;


  // Gera datas padrão para o mês atual
  const today = new Date();
  const month = today.getMonth(); // 0 = Janeiro
  const year = today.getFullYear();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  //Formata a data.
  const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const initialDateStr = formatDate(firstDay);
const finalDateStr = formatDate(lastDay);

//Preenche os inputs do filtro de data.
if (initialDateInput && finalDateInput) {
  initialDateInput.value = initialDateStr;
  finalDateInput.value = finalDateStr;
}

// Primeira chamada com as datas padrão do mês atual
await loadDashboardWithFilter(initialDateStr, finalDateStr);

//Clique no botão filtrar.
if (filterBtn) {
  filterBtn.addEventListener('click', async () => {
    const newInitial = initialDateInput.value;
    const newFinal = finalDateInput.value;
    await loadDashboardWithFilter(newInitial, newFinal);
  });
}

//Faz a requisição ao backend com os filtros de data.
try {
  const response = await authorizedFetch(
    `http://localhost:3000/api/dashboard?data_inicial=${initialDateStr}&data_final=${finalDateStr}`,
    {
      method: "GET"
    }
  );

  const data = await response.json();

  // Preenche os cards com os dados da API
  (document.getElementById('total-sales') as HTMLElement).textContent = data.total_vendas;
  (document.getElementById('total-purchases') as HTMLElement).textContent = data.total_compras;
  (document.getElementById('critical-inventory') as HTMLElement).textContent = data.produtos_estoque_baixo;
  (document.getElementById('active-customers') as HTMLElement).textContent = data.clientes_ativos;
  (document.getElementById('active-suppliers') as HTMLElement).textContent = data.fornecedores_ativos;

} catch (err) {
  console.error('Erro ao carregar dados do Dashboard:', err);
}
  
});

