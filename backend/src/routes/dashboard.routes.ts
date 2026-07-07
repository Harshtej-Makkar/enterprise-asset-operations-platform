import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const dashboardRouter = Router();

dashboardRouter.get('/kpis', requireAuth, (req, res) => dashboardController.kpis(req, res));
dashboardRouter.get('/recent', requireAuth, (req, res) => dashboardController.recent(req, res));
