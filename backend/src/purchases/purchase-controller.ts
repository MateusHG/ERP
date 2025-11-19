import { Request, Response } from "express";
import { createPurchaseService, deletePurchaseByIdService, getAllPurchasesService, getPurchaseByIdService, updatePurchaseByIdService } from "../purchases/purchase-service";
import { StockInsufficientError } from "../inventory/inventory-model";


export const getPurchases = async (req: Request, res: Response) => {
  const filters = {
    id: typeof req.query.id === 'string' ? Number(req.query.id): undefined,
    fornecedor_nome: req.query.fornecedor_nome as string,
    status: req.query.status as string,
    data_emissao_inicio: req.query.data_emissao_inicio as string,
    data_emissao_final: req.query.data_emissao_final as string,
  };

  const httpResponse = await getAllPurchasesService(filters);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getPurchaseById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await getPurchaseByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
}

export const postPurchase = async (req: Request, res: Response) => {
  try {
    const purchase = req.body
    const userId = req.user!.id;
    const httpResponse = await createPurchaseService(purchase, userId);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  
  } catch (err: any) {
    if (err instanceof StockInsufficientError) {
      res.status(400).json({
        message: err.message,
        inconsistencies: err.inconsistencies
      });
    }
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor." });
  }
};

export const patchPurchaseById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const userId = req.user!.id;
    const httpResponse = await updatePurchaseByIdService(id, data, userId);
    res.status(httpResponse.statusCode).json(httpResponse.body);
  } catch (err: any) {
    if (err instanceof StockInsufficientError) {
      res.status(400).json({
        message: err.message,
        inconsistencies: err.inconsistencies
      });
    }
  }
};

export const deletePurchaseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const httpResponse = await deletePurchaseByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};