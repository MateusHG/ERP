import { Request, Response } from "express";
import { deleteSaleItemService, getSaleItemsService, postSaleItemService, updateSaleItemService } from "../sales/sale-item-service";

export const getSaleItems = async (req: Request, res: Response) => {
  const saleId = Number(req.params.id);
  const httpResponse = await getSaleItemsService(saleId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const postSaleItem = async (req: Request, res: Response) => {
  const saleId = Number(req.params.id);
  const saleItem = req.body;
  const httpResponse = await postSaleItemService(saleId, saleItem);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchSaleItem = async (req: Request, res: Response) => {
  const saleId = Number(req.params.saleId);
  const saleItemId = Number(req.params.saleItemId);
  const updatedItem = req.body;
  const httpResponse = await updateSaleItemService(saleId, saleItemId, updatedItem);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deleteSaleItem = async (req: Request, res: Response) => {
  const saleId = Number(req.params.saleId);
  const saleItemId = Number(req.params.saleItemId);
  const httpResponse = await deleteSaleItemService(saleId, saleItemId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};