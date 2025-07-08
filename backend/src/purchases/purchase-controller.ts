import { Request, Response } from "express";
import { createPurchaseService, deletePurchaseByIdService, getAllPurchasesService, getPurchaseByIdService, updatePurchaseByIdService } from "../purchases/purchase-service";


export const getPurchases = async (req: Request, res: Response) => {
  const httpResponse = await getAllPurchasesService();
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const getPurchaseById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const httpResponse = await getPurchaseByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
}

export const postPurchase = async (req: Request, res: Response) => {
  const purchase = req.body
  const httpResponse = await createPurchaseService(purchase);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchPurchaseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const data = req.body;
  const httpResponse = await updatePurchaseByIdService(id, data);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deletePurchaseById = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const httpResponse = await deletePurchaseByIdService(id);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};