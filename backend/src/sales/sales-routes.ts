import { Router } from "express";
import { deleteSalesById, getSaleById, getSales, patchSaleById, postSales } from "../sales/sales-controller";
import authenticate from "../auth/auth-middleware";

const salesRouter = Router();

salesRouter.use(authenticate);

salesRouter.get("/", getSales);
salesRouter.get("/:id", getSaleById);

salesRouter.post("/", postSales);

salesRouter.patch("/:id", patchSaleById);

salesRouter.delete("/:id", deleteSalesById);


export default salesRouter;