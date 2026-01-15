import Chart from "chart.js/auto";
import { hoverPlugin } from "./dashboard-hover-plugin";
import { TreemapController, TreemapElement } from "chartjs-chart-treemap";

Chart.register(hoverPlugin);

let customersChart: Chart | null = null;
let suppliersChart: Chart | null = null;

export function updateRankingCharts(customers: any[] = [], suppliers: any[] = []) {
  const customerLabels = customers.map(c => c.cliente || c.name);
  const customerValues = customers.map(c => c.total_vendido || c.total);
  const customerSalesQty = customers.map(c =>  c.quantidade_vendas);

  const supplierLabels = suppliers.map(s => s.fornecedor || s.name);
  const supplierValues = suppliers.map(s => s.total_comprado || s.total);
  const supplierPurchasesQty = suppliers.map(s => s.quantidade_compras);

  // destruir gráficos antigos para recriar
  customersChart?.destroy();
  suppliersChart?.destroy();

customersChart = new Chart(
  document.getElementById("top-customers-chart") as HTMLCanvasElement,
  {
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
          displayColors: false, // ⬅️ remove quadrado padrão
          callbacks: {
            label: function (ctx) {
              const idx = ctx.dataIndex;
              const faturamento = Number(customerValues[idx]).toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2 }
              );
              const qtde = customerSalesQty[idx];

              const corFaturamento = "🟦"; 
              const corQuantidade = "🟩";  

              return [
                `${corFaturamento} Faturamento: R$ ${faturamento}`,
                `${corQuantidade} Vendas: ${qtde}`
              ];
            }
          }
        }
      }
    }
  }
);



suppliersChart = new Chart(
  document.getElementById("top-suppliers-chart") as HTMLCanvasElement,
  {
    type: "bar",
    data: {
      labels: supplierLabels,
      datasets: [
        {
          label: "Total Comprado (R$)",
          data: supplierValues,
          backgroundColor: "rgba(255,159,64,0.7)"
        }
      ]
    },
    options: {
      indexAxis: "y",
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,  // ⬅️ Remove o quadrado padrão
          callbacks: {
            label: function (ctx) {
              const idx = ctx.dataIndex;
              const total = Number(supplierValues[idx]).toLocaleString(
                "pt-BR",
                { minimumFractionDigits: 2 }
              );
              const qtde = supplierPurchasesQty[idx];

              const corTotal = "🟧";  // laranja forte
              const corQuantidade = "🟨"; // laranja claro

              return [
                `${corTotal} Total Comprado: R$ ${total}`,
                `${corQuantidade} Compras: ${qtde}`
              ];
            }
          }
        }
      }
    }
  }
);
};