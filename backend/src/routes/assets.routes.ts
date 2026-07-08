import { Router } from 'express';
import { assetsController } from '../controllers/assets.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Assets router — replaces the Week 1 stub.
 *
 * Routes:
 *   GET /             → paginated list (page, pageSize, search, plantId, status)
 *   GET /:id          → detail
 *   GET /:id/inspections → inspection history for this asset
 *   GET /:id/defects     → defect history for this asset
 */

export const assetsRouter = Router();

assetsRouter.use(requireAuth);

assetsRouter.get('/', (req, res) => assetsController.list(req, res));
assetsRouter.get('/:id', (req, res) => assetsController.get(req, res));
assetsRouter.get('/:id/inspections', (req, res) => assetsController.inspectionsForAsset(req, res));
assetsRouter.get('/:id/defects', (req, res) => assetsController.defectsForAsset(req, res));
