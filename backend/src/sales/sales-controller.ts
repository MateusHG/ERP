import { Request, Response } from "express";
import { createSalesService, deleteSaleByIdService, getAllSalesService, getSaleByIdService, updateSaleByIdService } from "../sales/sales-service";

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
  const sales = req.body
  const httpResponse = await createSalesService(sales);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchSaleById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  const httpResponse = await updateSaleByIdService(id, data);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deleteSalesById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await deleteSaleByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};