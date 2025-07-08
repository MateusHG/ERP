import { Router } from "express";
import { deletePurchaseById, getPurchaseById, getPurchases, patchPurchaseById, postPurchase } from "../purchases/purchase-controller";

const purchaseRouter = Router();

purchaseRouter.get("/", getPurchases);
purchaseRouter.get("/:id", getPurchaseById);

purchaseRouter.post("/", postPurchase);

purchaseRouter.patch("/:id", patchPurchaseById);

purchaseRouter.delete("/:id", deletePurchaseById);

export default purchaseRouter;