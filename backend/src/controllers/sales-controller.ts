import { Request, Response } from "express";
import { createSalesService, deleteSaleByIdService, getAllSalesService, getSaleByIdService, updateSaleByIdService } from "../services/sales-service";

export const getSales = async (req: Request, res: Response) => {
  const httpResponse = await getAllSalesService();
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