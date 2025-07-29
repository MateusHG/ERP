import { Router } from "express";
import { deletePurchaseById, getPurchaseById, getPurchases, patchPurchaseById, postPurchase } from "../purchases/purchase-controller";
import authenticate from "../auth/auth-middleware";

const purchaseRouter = Router();

purchaseRouter.use(authenticate);

purchaseRouter.get("/", getPurchases);
purchaseRouter.get("/:id", getPurchaseById);

purchaseRouter.post("/", postPurchase);

purchaseRouter.patch("/:id", patchPurchaseById);

purchaseRouter.delete("/:id", deletePurchaseById);

export default purchaseRouter;