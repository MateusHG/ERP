import { Router } from "express";
import { deleteSalesById, getSaleById, getSales, patchSaleById, postSales } from "../controllers/sales-controller";

const salesRouter = Router();

salesRouter.get("/", getSales);
salesRouter.get("/:id", getSaleById);

salesRouter.post("/", postSales);

salesRouter.patch("/:id", patchSaleById);

salesRouter.delete("/:id", deleteSalesById);


export default salesRouter;