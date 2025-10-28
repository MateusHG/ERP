import { Router } from 'express';
import authenticate from "../auth/auth-middleware";
import { getBalanceController, listInventoryController, listMovementsController, registerMovementController } from './inventory-controller';

const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get("/listar", listInventoryController);

inventoryRouter.post("/movimentar", registerMovementController);

inventoryRouter.get("/saldo/:id", getBalanceController);
inventoryRouter.get("/movimentacoes/:id", listMovementsController);

export default inventoryRouter;