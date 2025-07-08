import { Router } from "express";
import { deletePurchaseItem, getPurchaseItems, patchPurchaseItem, postPurchaseItem } from "../purchases/purchase-item-controller";
 
const purchaseItemRouter = Router();

//Não vou colocar by ID, creio que fica implícito que se estou consultando os item de uma compra, por tanto é necessário identificar qual a compra(id).
purchaseItemRouter.get("/:id", getPurchaseItems); 

purchaseItemRouter.post("/:id", postPurchaseItem);

purchaseItemRouter.patch("/:purchaseId/item/:purchaseItemId", patchPurchaseItem); //Primeiro ID referencia á compra, e o segundo ao item dentro da compra, evita erros.

purchaseItemRouter.delete("/:purchaseId/item/:purchaseItemId", deletePurchaseItem);

export default purchaseItemRouter;