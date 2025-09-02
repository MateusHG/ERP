import { Request, Response } from 'express';
import { getBalanceService, listMovementsService, registerMovementService } from "./inventory-service";

export const registerMovementController = async (req: Request, res: Response) => {
  const httpResponse = await registerMovementService(req.body);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getBalanceController = async (req: Request, res: Response) => {
  const productId = Number(req.params.id);

  const httpResponse = await getBalanceService(productId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const listMovementsController = async (req: Request, res: Response) => {
  const productId = Number(req.params.id)
  
  const httpResponse = await listMovementsService(productId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

