import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { formatCurrency, getCurrentMonthDateRange } from "../utils/formatters";
import { authorizedFetch } from "../utils/fetch-helper";
import Chart from "chart.js/auto";

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
(document.getElementById('total-sales-value') as HTMLElement).textContent =
  formatCurrency(data.total_vendas_finalizadas_valores);

(document.getElementById('total-sales-count') as HTMLElement).textContent =
  `Finalizadas: ${data.total_vendas_finalizadas ?? 0}`;

(document.getElementById('total-sales-pending') as HTMLElement).textContent =
  `Pendentes: ${data.total_vendas_pendentes ?? 0}`;

// insight opcional
(document.getElementById("sales-insight") as HTMLElement).textContent =
  `Aprovações pendentes: ${data.total_vendas_aguardando_aprovacao ?? 0}`;


// ========== Compras ==============
(document.getElementById('total-purchases-value') as HTMLElement).textContent =
  formatCurrency(data.total_compras_finalizadas_valores);

(document.getElementById('total-purchases-count') as HTMLElement).textContent =
  `Finalizadas: ${data.total_compras_finalizadas ?? 0}`;

(document.getElementById('total-purchases-pending') as HTMLElement).textContent =
  `Pendentes: ${data.total_compras_pendentes ?? 0}`;

(document.getElementById('purchases-insight') as HTMLElement).textContent =
  `Aguardando aprovação: ${data.total_compras_aguardando_aprovacao ?? 0}`;


// ========== Estoque ==============
(document.getElementById('below-minimum') as HTMLElement).textContent =
  data.produtos_estoque_baixo ?? 0;

(document.getElementById('inventory-insight') as HTMLElement).textContent =
  `Médio: ${data.produtos_estoque_medio}   •   Alto: ${data.produtos_estoque_alto}`;


// ========== Clientes ==============
(document.getElementById('active-customers') as HTMLElement).textContent =
  data.clientes_ativos ?? 0;

(document.getElementById('new-monthly-customers') as HTMLElement).textContent =
  `Novos no mês: ${data.clientes_novos_mes ?? 0}`;

(document.getElementById('customers-insight') as HTMLElement).textContent =
  `Inativos: ${data.clientes_inativos ?? 0}`;


// ========== Fornecedores ==============
(document.getElementById('active-suppliers') as HTMLElement).textContent =
  data.fornecedores_ativos ?? 0;

(document.getElementById('inactive-suppliers') as HTMLElement).textContent =
  `Inativos: ${data.fornecedores_inativos ?? 0}`;

(document.getElementById('suppliers-insight') as HTMLElement).textContent =
  `Novos no mês: ${data.fornecedores_novos_mes ?? 0}`;
  
  } catch (err) {
    console.error('Erro ao carregar os dados do Dashboard:', err);
  }
};


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


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// =========================
// RANKING DOS CLIENTES
// =========================

// Dados (substituir pela API)
const topCustomers = [
  { name: "Cliente A", total: 18240 },
  { name: "Cliente B", total: 12900 },
  { name: "Cliente C", total: 10310 },
  { name: "Cliente D", total: 8440 },
  { name: "Cliente E", total: 7920 }
];

const customerLabels = topCustomers.map(c => c.name);
const customerValues = topCustomers.map(c => c.total);

// =========================
// RANKING DOS FORNECEDORES
// =========================

const topSuppliers = [
  { name: "Fornecedor XPTO", total: 33200 },
  { name: "Distribuidora Central", total: 27100 },
  { name: "Supply Master", total: 19850 },
  { name: "Comercial Rio", total: 17440 },
  { name: "Atacadão Sul", total: 15590 }
];

const supplierLabels = topSuppliers.map(s => s.name);
const supplierValues = topSuppliers.map(s => s.total);

// =============================================
// PLUGIN DE HOVER SEGURO (REAPROVEITADO)
// =============================================
const hoverPlugin = {
  id: "barHoverEffect",
  afterEvent(chart: Chart, args: any) {
    const event = args.event;
    if (!event) return;

    const active = chart.getActiveElements();
    const canvas = chart.canvas;

    let highlight = canvas.parentElement?.querySelector(".hover-bar-highlight") as HTMLElement;

    if (!highlight) {
      highlight = document.createElement("div");
      highlight.className = "hover-bar-highlight";
      highlight.style.position = "absolute";
      highlight.style.left = "0";
      highlight.style.right = "0";
      highlight.style.pointerEvents = "none";
      highlight.style.background = "rgba(54,162,235,0.15)";
      highlight.style.borderRadius = "6px";
      highlight.style.transition = "all .15s ease";
      highlight.style.opacity = "0";
      highlight.style.zIndex = "10";
      canvas.parentElement?.appendChild(highlight);
    }

    if (!active.length) {
      highlight.style.opacity = "0";
      return;
    }

    const bar = active[0];
    const element: any = bar.element;

    if (!element) {
      highlight.style.opacity = "0";
      return;
    }

    highlight.style.opacity = "1";
    highlight.style.top = `${element.y}px`;
    highlight.style.height = `${element.height}px`;
  }
};

Chart.register(hoverPlugin);

// =============================================
// GRÁFICO DE CLIENTES
// =============================================
new Chart(document.getElementById("top-customers-chart") as HTMLCanvasElement, {
  type: "bar",
  data: {
    labels: customerLabels,
    datasets: [
      {
        label: "Faturamento (R$)",
        data: customerValues,
        backgroundColor: "rgba(54,162,235,0.7)"
      }
    ]
  },
  options: {
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `R$ ${Number(ctx.raw).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        }
      }
    }
  }
});

// =============================================
// GRÁFICO DE FORNECEDORES
// =============================================
new Chart(document.getElementById("top-suppliers-chart") as HTMLCanvasElement, {
  type: "bar",
  data: {
    labels: supplierLabels,
    datasets: [
      {
        label: "Total Comprado (R$)",
        data: supplierValues,
        backgroundColor: "rgba(255,159,64,0.7)" // cor diferente para distinguir
      }
    ]
  },
  options: {
    indexAxis: "y",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `R$ ${Number(ctx.raw).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        }
      }
    }
  }
});

function updateInsights(data: any) {
  // Exemplo: vendas cresceram / caíram
  if (data.sales.growth > 0) {
    document.getElementById("sales-insight")!.textContent =
      `▲ Crescimento de ${data.sales.growth}% vs período anterior`;
  } else {
    document.getElementById("sales-insight")!.textContent =
      `▼ Queda de ${Math.abs(data.sales.growth)}% no período`;
  }

  // Compras pendentes
  document.getElementById("purchases-insight")!.textContent =
    data.purchases.pending > 5
      ? "⚠ Muitas compras ainda estão pendentes!"
      : "✓ Compras sob controle";

  // Estoque
  document.getElementById("inventory-insight")!.textContent =
    data.inventory.belowMin > 0
      ? `⚠ ${data.inventory.belowMin} itens abaixo do mínimo`
      : "✓ Estoque saudável";

  // Clientes
  document.getElementById("customers-insight")!.textContent =
    `+${data.customers.new} novos clientes este mês`;

  // Fornecedores
  document.getElementById("suppliers-insight")!.textContent =
    `${data.suppliers.inactive} fornecedores inativos`;
};