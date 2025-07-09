import { internalServerError, ok } from "../utils/http-helper";
import * as dashboardRepository from '../dashboards/dashboard-repository';

export const getDashboardService = async (filters: {data_inicial: string, data_final: string}) => {
  try {
    const dashboard = await dashboardRepository.getGeneralDashboard(filters.data_inicial, filters.data_final);
    return ok(dashboard);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao gerar Dashboard.');
  }
};