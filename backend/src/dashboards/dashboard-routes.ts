import { Router } from 'express';
import { getDashboardController } from './dashboard-controller';
import { authenticate } from '../auth/auth-middleware';

const dashboardsRoutes = Router();

dashboardsRoutes.get("/", authenticate, getDashboardController);

export default dashboardsRoutes;