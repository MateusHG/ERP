import { Router } from 'express';
import authenticate from "../auth/auth-middleware";
import { getBalanceController, listInventoryController, listMovementsController, registerMovementController } from './inventory-controller';

const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.get("/listar", listInventoryController);

inventoryRouter.get("/movimentacoes/:id", listMovementsController);

inventoryRouter.post("/movimentar", registerMovementController);

inventoryRouter.get("/saldo/:id", getBalanceController);

export default inventoryRouter;