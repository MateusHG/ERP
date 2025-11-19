import { Request, Response } from "express";
import { createSalesService, deleteSaleByIdService, getAllSalesService, getSaleByIdService, updateSaleByIdService } from "../sales/sales-service";
import { StockInsufficientError } from "../inventory/inventory-model";

export const getSales = async (req: Request, res: Response) => {
  const filters = {
    id: typeof req.query.id === 'string' ? Number(req.query.id): undefined,
    cliente_nome: req.query.cliente_nome as string,
    status: req.query.status as string,
    data_emissao_inicio: req.query.data_emissao_inicio as string,
    data_emissao_final: req.query.data_emissao_final as string,
  };
  
  const httpResponse = await getAllSalesService(filters);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getSaleById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await getSaleByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const postSales = async (req: Request, res: Response) => {
  try {
  const sale = req.body
  const userId = req.user!.id;
  const httpResponse = await createSalesService(sale, userId);
  res.status(httpResponse.statusCode).json(httpResponse.body);

} catch (err: any) {
  if (err instanceof StockInsufficientError) {
    res.status(400).json({
      message: err.message,
      inconsistencies: err.inconsistencies
    });
  }
  console.error(err);
  res.status(500).json({ error: "Erro interno no servidor. "});
}
}

export const patchSaleById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    const userId = req.user!.id;
    const httpResponse = await updateSaleByIdService(id, data, userId);
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

export const deleteSalesById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await deleteSaleByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};