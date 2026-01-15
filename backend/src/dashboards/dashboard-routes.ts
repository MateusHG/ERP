import { Router } from 'express';
import { getDashboardController, getDashboardRankingController } from './dashboard-controller';
import { authenticate } from '../auth/auth-middleware';

const dashboardsRoutes = Router();

dashboardsRoutes.get("/", authenticate, getDashboardController);

dashboardsRoutes.get("/ranking", getDashboardRankingController);

export default dashboardsRoutes;