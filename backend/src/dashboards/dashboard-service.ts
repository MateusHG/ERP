import { badRequest, internalServerError, ok } from "../utils/http-helper";
import * as dashboardRepository from '../dashboards/dashboard-repository';
import db from "../config/db";

export const getDashboardService = async (filters: {data_inicial: string, data_final: string }) => {
  try {
    const dashboard = await dashboardRepository.getGeneralDashboard(filters.data_inicial, filters.data_final);
    return ok(dashboard);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao gerar Dashboard.');
  }
};

export const getDashboardRankingService = async (filters: { data_inicial: string; data_final: string; }) => {
  try {
    if (!filters.data_inicial || !filters.data_final) {
      return badRequest("Obrigatório informar data_inicial e data_final.");
    }

    const rankingCustomers = await dashboardRepository.getTopCustomers(filters.data_inicial, filters.data_final);
    const rankingSuppliers = await dashboardRepository.getTopSuppliers(filters.data_inicial, filters.data_final);


    return ok({ rankingCustomers, rankingSuppliers });

  } catch (err) {
    console.error(err);
    return internalServerError("Erro interno no servidor ao gerar dashboard.");
  }
};