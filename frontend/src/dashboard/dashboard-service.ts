import { authorizedFetch } from "../utils/fetch-helper";

export async function getDashboard(dataInicial: string, dataFinal: string) {
  const response = await authorizedFetch(
    `https://localhost:3000/api/dashboard?data_inicial=${dataInicial}&data_final=${dataFinal}`
  );
  return response.json();
};

export async function getDashboardRanking(dataInicial: string, dataFinal: string) {
  const response = await authorizedFetch(
    `https://localhost:3000/api/dashboard/ranking?data_inicial=${dataInicial}&data_final=${dataFinal}`
  );
  return response.json();
};