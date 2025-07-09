import { Request, Response } from 'express';
import { getDashboardService } from './dashboard-service';

export const getDashboard = async (req: Request, res: Response) => {
  const { data_inicial, data_final } = req.query;

  if (!data_inicial || !data_final) {
    return res.status(400).json({message: 'Datas Obrigatórias'});
  }

  try {
    const httpResponse = await getDashboardService({
      data_inicial: data_inicial as string,
      data_final: data_final as string
    });

    return res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (err) {
    return res.status(500).json({message: 'Erro interno do servidor.'})
  }
};