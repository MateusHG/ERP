import { Router } from 'express';
import authenticate from "../auth/auth-middleware";
import { handlePurchaseInventoryMovementController, handleSaleInventoryMovementController, listInventoryController, listMovementsController, registerInventoryAdjustmentController } from './inventory-controller';

const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get("/listar", listInventoryController);

inventoryRouter.get("/movimentacoes/:id", listMovementsController);

inventoryRouter.post("/ajuste", registerInventoryAdjustmentController);

inventoryRouter.patch("/compras/:id/movimentar", handlePurchaseInventoryMovementController);
inventoryRouter.patch("/vendas/:id/movimentar", handleSaleInventoryMovementController);

export default inventoryRouter;