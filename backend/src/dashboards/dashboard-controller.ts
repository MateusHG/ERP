import { Request, Response } from 'express';
import { getDashboardRankingService, getDashboardService } from './dashboard-service';

export const getDashboardController = async (req: Request, res: Response) => {
  const { data_inicial, data_final } = req.query;

  if (!data_inicial || !data_final) {
    res.status(400).json({message: 'Datas Obrigatórias'});
    return;
  }

  try {
    const httpResponse = await getDashboardService({
      data_inicial: data_inicial as string,
      data_final: data_final as string
    });

    res.status(httpResponse.statusCode).json(httpResponse.body);
    return;
  } catch (err) {
    res.status(500).json({message: 'Erro interno do servidor.'})
    return;
  }
};

export const getDashboardRankingController = async (req: Request, res: Response) => {
  const filters = {
    data_inicial: req.query.data_inicial as string,
    data_final: req.query.data_final as string,
  }
  
  const httpResponse = await getDashboardRankingService(filters);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};
