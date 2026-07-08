import { Router } from 'express';
import { assetTypesList, plantsList } from '../controllers/inspections.controller.js';
import { seedAssetTypes, seedPlants } from '../repositories/memory-store.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Plant + asset-type read endpoints. Lightweight — used by the asset
 * filter dropdown on the Asset List page and the asset picker on the
 * New Inspection page. Asset type details (with the linked checklist
 * template) live at /api/asset-types/:id/checklist-template.
 */

export const plantsRouter = Router();
plantsRouter.get('/', requireAuth, (_req, res) => {
  res.json({ data: plantsList(), total: seedPlants.length });
});

export const assetTypesRouter = Router();
assetTypesRouter.get('/', requireAuth, (_req, res) => {
  res.json({ data: assetTypesList(), total: seedAssetTypes.length });
});
