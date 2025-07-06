import { Request, Response } from "express";
import { deletePurchaseItemService, getPurchaseItemsService, postPurchaseItemService, updatePurchaseItemService } from "../services/purchase-item-service";

export const getPurchaseItems = async (req: Request, res: Response) => {
  const purchaseId = Number(req.params.id);
  const httpResponse = await getPurchaseItemsService(purchaseId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const postPurchaseItem = async (req: Request, res: Response) => {
  const purchaseId = Number(req.params.id);
  const purchaseItem = req.body;
  const httpResponse = await postPurchaseItemService(purchaseId, purchaseItem);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const patchPurchaseItem = async (req: Request, res: Response) => {
  const purchaseId = Number(req.params.purchaseId);
  const purchaseItemId = Number(req.params.purchaseItemId);
  const updatedItem = req.body;
  const httpResponse = await updatePurchaseItemService(purchaseId, purchaseItemId, updatedItem);
  return res.status(httpResponse.statusCode).json(httpResponse.body);
};

export const deletePurchaseItem = async (req: Request, res: Response) => {
  const purchaseId = Number(req.params.purchaseId);
  const purchaseItemId = Number(req.params.purchaseItemId);
  const httpResponse = await deletePurchaseItemService(purchaseId, purchaseItemId);
  res.status(httpResponse.statusCode).json(httpResponse.body);
};