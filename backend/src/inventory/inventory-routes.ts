import { Router } from 'express';
import authenticate from "../auth/auth-middleware";
import { getBalanceController, listMovementsController, registerMovementController } from './inventory-controller';

const inventoryRouter = Router();

inventoryRouter.use(authenticate);

inventoryRouter.post("/movimentar", registerMovementController);

inventoryRouter.get("/saldo/:id", getBalanceController);
inventoryRouter.get("/movimentacoes/:id", listMovementsController);

export default inventoryRouter;