import { Router } from 'express';
import { getDashboard } from './dashboard-controller';
import { authenticate } from '../auth/auth-middleware';

const dashboardsRoutes = Router();

dashboardsRoutes.get("/", authenticate, getDashboard);

export default dashboardsRoutes;