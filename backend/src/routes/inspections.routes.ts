import { Router } from 'express';
import { inspectionsController } from '../controllers/inspections.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Inspections router — replaces the Week 1 stub.
 *
 * Routes:
 *   GET  /                            → paginated list (page, pageSize, assetId, status, from, to)
 *   POST /                            → create new inspection (the dynamic-checklist submission)
 *   GET  /:id                         → detail
 *   GET  /:id/items                   → per-item results for this inspection
 *   GET  /asset-types/:id/checklist-template → template + items for the given asset type
 */

export const inspectionsRouter = Router();

inspectionsRouter.use(requireAuth);

// The asset-type template route must be declared before the dynamic :id
// route so that Express matches the literal segment first.
inspectionsRouter.get(
  '/asset-types/:assetTypeId/checklist-template',
  (req, res) => inspectionsController.checklistForAssetType(req, res),
);

inspectionsRouter.get('/', (req, res) => inspectionsController.list(req, res));
inspectionsRouter.post('/', (req, res) => inspectionsController.create(req as never, res));
inspectionsRouter.get('/:id', (req, res) => inspectionsController.get(req, res));
inspectionsRouter.get('/:id/items', (req, res) => inspectionsController.itemsForInspection(req, res));
