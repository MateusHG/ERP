import { Router } from "express";
import { deleteSaleItem, getSaleItems, patchSaleItem, postSaleItem } from "../sales/sale-item-controller";

const saleItemRouter = Router();

saleItemRouter.get("/:id", getSaleItems);

saleItemRouter.post("/:id", postSaleItem);

saleItemRouter.patch("/:saleId/item/:saleItemId", patchSaleItem); //Primeiro ID referencia á compra, e o segundo ao item dentro da compra, evita erros.

saleItemRouter.delete("/:saleId/item/:saleItemId", deleteSaleItem);

export default saleItemRouter;