import { Router } from 'express';
import authenticate from "../auth/auth-middleware";
import { handlePurchaseInventoryMovementController, handleSaleInventoryMovementController, listInventoryController, listMovementsController, registerMovementController } from './inventory-controller';

const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get("/listar", listInventoryController);
inventoryRouter.get("/movimentacoes/:id", listMovementsController);
inventoryRouter.post("/movimentar/ajuste", registerMovementController);

inventoryRouter.patch("/compras/:id/movimentar", handlePurchaseInventoryMovementController);
inventoryRouter.patch("/vendas/:id/movimentar", handleSaleInventoryMovementController);

export default inventoryRouter;