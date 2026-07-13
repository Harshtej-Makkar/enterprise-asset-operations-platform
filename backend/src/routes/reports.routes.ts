import { Router } from 'express';
import { reportsController } from '../controllers/reports.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Reports router — replaces the Week 1 stub (Week 5 implementation).
 *
 * Routes:
 *   GET    /                            → list previously generated reports
 *   POST   /generate                    → generate a new report
 *   GET    /:id                         → preview a generated report
 *   GET    /:id/export?format=csv       → CSV download
 */

export const reportsRouter = Router();

reportsRouter.use(requireAuth);

reportsRouter.get('/', (req, res) => reportsController.list(req, res));
reportsRouter.post('/generate', (req, res) => reportsController.generate(req as never, res));
reportsRouter.get('/:id', (req, res) => reportsController.get(req, res));
reportsRouter.get('/:id/export', (req, res) => reportsController.exportCsv(req, res));