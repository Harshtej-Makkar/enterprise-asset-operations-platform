import { Router } from 'express';
import { defectsController } from '../controllers/defects.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Defects router — Week 3 real implementation.
 *
 * Routes:
 *   GET  /                 → paginated list (page, pageSize, severity, status, plantId)
 *   GET  /:id              → single defect detail
 *   POST /                 → create (log) a new defect
 *   POST /:id/approval     → approve or reject a critical defect
 *   PATCH /:id/status       → update defect status (e.g. resolve)
 */

export const defectsRouter = Router();

defectsRouter.use(requireAuth);

defectsRouter.get('/', (req, res) => defectsController.list(req, res));
defectsRouter.get('/:id', (req, res) => defectsController.get(req, res));
defectsRouter.post('/', (req, res) => defectsController.create(req as never, res));
defectsRouter.post('/:id/approval', (req, res) => defectsController.approve(req as never, res));
defectsRouter.patch('/:id/status', (req, res) => defectsController.patchStatus(req as never, res));
