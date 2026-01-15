import { initHeaderData, initLogout, initNavigation } from "../utils/navigation";
import { getCurrentMonthDateRange } from "../utils/formatters";
import { getDashboard, getDashboardRanking } from "./dashboard-service";
import { updateDashboardCards } from "./dashboard-dom";
import { updateRankingCharts } from "./dashboard-charts";

window.addEventListener("DOMContentLoaded", async () => {
  initNavigation();
  initHeaderData();
  initLogout();

  const initial = document.getElementById("initial-date") as HTMLInputElement;
  const final = document.getElementById("final-date") as HTMLInputElement;
  const filterBtn = document.getElementById("filter-btn")!;

  const { start, end } = getCurrentMonthDateRange();

  initial.value = start;
  final.value = end;

  await loadDashboard(start, end);

  filterBtn.addEventListener("click", () => {
    loadDashboard(initial.value, final.value);
  });
});

async function loadDashboard(dataInicial: string, dataFinal: string) {
  const dashboard = await getDashboard(dataInicial, dataFinal);
  const ranking = await getDashboardRanking(dataInicial, dataFinal);

  updateDashboardCards(dashboard);
  updateRankingCharts(ranking.rankingCustomers, ranking.rankingSuppliers);
};