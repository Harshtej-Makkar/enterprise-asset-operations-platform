import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  allInspections,
  runtimeAuditLogs,
  runtimeInspections,
  runtimeNotifications,
  seedAssetTypes,
  seedAssets,
  seedChecklistTemplateItems,
  seedChecklistTemplates,
  seedPlants,
  seedUsers,
} from '../repositories/memory-store.js';
import type { AuthedRequest } from '../middleware/auth.js';
import type { Asset, Inspection, OverallResult, User } from '../types/domain.js';
import { toInspectionDto } from '../mappers/domain-dtos.js';

/**
 * Inspections controller — list, detail, dynamic-checklist lookup, create.
 *
 * POST /api/inspections is the most "real" endpoint in the mock backend:
 * it accepts a checklist-form payload, validates that any item marked
 * `requires_photo: true` has a non-empty photoUrl, computes the overall
 * result, persists to `runtimeInspections`, and writes an audit log entry.
 * The next time the user lists inspections, the new one shows up.
 */

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parseIntParam(value: unknown, fallback: number, min = 1, max = Infinity): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function computeOverallResult(itemResults: Array<{ result?: string }>): OverallResult {
  if (itemResults.some((i) => i.result === 'fail')) return 'fail';
  // All pass or all na → pass. Pending only → pending.
  if (itemResults.length === 0) return 'pending';
  if (itemResults.every((i) => i.result !== 'pending' && i.result !== undefined)) return 'pass';
  return 'pending';
}

export const inspectionsController = {
  /**
   * GET /api/inspections
   * Query params: page (0-indexed), pageSize, assetId, status, from, to
   * (status, from, to are NOT yet implemented in the filter — Week 2 scope
   * is the read path for the list page; date/status filters land in Week 3
   * when the Defect module also needs them. The seed data is small enough
   * that the frontend's client-side filter is the right tradeoff for now.)
   */
  list(req: Request, res: Response): void {
    const page = parseIntParam(req.query.page, 0, 0);
    const pageSize = parseIntParam(req.query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const assetId = typeof req.query.assetId === 'string' ? req.query.assetId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;

    let rows = allInspections().slice();
    if (assetId) rows = rows.filter((i) => i.asset_id === assetId);
    if (status) {
      const statuses = status.split(',').map((s) => s.trim()).filter(Boolean);
      if (statuses.length > 0) {
        rows = rows.filter((i) => statuses.includes(i.overall_result));
      }
    }
    if (from) rows = rows.filter((i) => i.scheduled_date >= from);
    if (to) rows = rows.filter((i) => i.scheduled_date <= to);

    // Newest first
    rows.sort((a, b) => {
      const ad = a.scheduled_date;
      const bd = b.scheduled_date;
      return bd.localeCompare(ad);
    });

    const total = rows.length;
    const start = page * pageSize;
    const slice = rows.slice(start, start + pageSize);

    res.json({
      data: slice.map(toInspectionDto),
      total,
      page,
      pageSize,
    });
  },

  /**
   * GET /api/inspections/:id
   */
  get(req: Request, res: Response): void {
    const id = req.params.id;
    const insp = allInspections().find((i) => i.id === id);
    if (!insp) {
      res.status(404).json({ message: `Inspection ${id} not found` });
      return;
    }
    res.json(toInspectionDto(insp));
  },

  /**
   * GET /api/inspections/:id/items
   * Returns the inspection_item rows for a single inspection, joined with
   * their checklist_template_item labels. Empty array for inspections
   * created from the seed (seed has no per-item rows).
   */
  itemsForInspection(req: Request, res: Response): void {
    const id = req.params.id;
    const insp = allInspections().find((i) => i.id === id);
    if (!insp) {
      res.status(404).json({ message: `Inspection ${id} not found` });
      return;
    }
    // The seed has only the parent inspection rows, not per-item rows. For
    // Week 2 the detail page just shows the parent record; per-item rows
    // are populated by the POST endpoint for newly created inspections and
    // are also written into the runtime store. Here we look up the runtime
    // store only — seed inspections have no per-item data to display.
    const runtimeItems = (req.app.get('inspectionItems') as Array<{
      id: string;
      inspection_id: string;
      checklist_template_item_id: string;
      result: string;
      notes: string | null;
      photo_url: string | null;
    }> | undefined) ?? [];
    const items = runtimeItems.filter((it) => it.inspection_id === id);
    const enriched = items
      .map((it) => {
        const tpl = seedChecklistTemplateItems.find((t) => t.id === it.checklist_template_item_id);
        return {
          id: it.id,
          checklistTemplateItemId: it.checklist_template_item_id,
          label: tpl?.label ?? '(unknown item)',
          requiresPhoto: tpl?.requires_photo ?? false,
          result: it.result,
          notes: it.notes,
          photoUrl: it.photo_url,
        };
      })
      .sort((a, b) => {
        const ai = seedChecklistTemplateItems.find((t) => t.id === a.checklistTemplateItemId);
        const bi = seedChecklistTemplateItems.find((t) => t.id === b.checklistTemplateItemId);
        return (ai?.order_index ?? 0) - (bi?.order_index ?? 0);
      });
    res.json({ data: enriched, total: enriched.length });
  },

  /**
   * GET /api/asset-types/:assetTypeId/checklist-template
   * Returns the active template + its items for the given asset type. This
   * is the dynamic-checklist endpoint that drives the inspection form.
   */
  checklistForAssetType(req: Request, res: Response): void {
    const assetTypeId = req.params.assetTypeId;
    const tpl = seedChecklistTemplates.find((t) => t.asset_type_id === assetTypeId);
    if (!tpl) {
      res.status(404).json({ message: `No checklist template for asset type ${assetTypeId}` });
      return;
    }
    const items = seedChecklistTemplateItems
      .filter((i) => i.checklist_template_id === tpl.id)
      .sort((a, b) => a.order_index - b.order_index);
    res.json({
      id: tpl.id,
      assetTypeId: tpl.asset_type_id,
      name: tpl.name,
      items: items.map((i) => ({
        id: i.id,
        label: i.label,
        orderIndex: i.order_index,
        requiresPhoto: i.requires_photo,
      })),
    });
  },

  /**
   * POST /api/inspections
   * Body: { assetId, scheduledDate, items: [{ checklistTemplateItemId, result, notes?, photoUrl? }] }
   *
   * Validates that each item's checklistTemplateItemId exists in the
   * template, that the result is a valid enum value, and that any item
   * marked `requires_photo: true` has a non-empty photoUrl. On success
   * creates the inspection + item rows, an audit log entry, and returns
   * the new inspection DTO.
   */
  create(req: AuthedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const body = req.body as {
      assetId?: string;
      scheduledDate?: string;
      items?: Array<{ checklistTemplateItemId?: string; result?: string; notes?: string | null; photoUrl?: string | null }>;
    } | undefined;

    if (!body?.assetId || !body.scheduledDate || !Array.isArray(body.items)) {
      res.status(400).json({ message: 'assetId, scheduledDate, and items[] are required' });
      return;
    }

    const asset: Asset | undefined = seedAssets.find((a) => a.id === body.assetId);
    if (!asset) {
      res.status(404).json({ message: `Asset ${body.assetId} not found` });
      return;
    }

    // Look up the template that applies to this asset's type.
    const tpl = seedChecklistTemplates.find((t) => t.asset_type_id === asset.asset_type_id);
    if (!tpl) {
      res.status(409).json({ message: `No checklist template for asset type ${asset.asset_type_id}` });
      return;
    }
    const tplItems = seedChecklistTemplateItems.filter((i) => i.checklist_template_id === tpl.id);

    // Validate every submitted item.
    for (const submitted of body.items) {
      if (!submitted.checklistTemplateItemId) {
        res.status(400).json({ message: 'Each item must have a checklistTemplateItemId' });
        return;
      }
      const tplItem = tplItems.find((i) => i.id === submitted.checklistTemplateItemId);
      if (!tplItem) {
        res.status(400).json({
          message: `Checklist item ${submitted.checklistTemplateItemId} does not belong to this asset's template`,
        });
        return;
      }
      if (!['pass', 'fail', 'na'].includes(submitted.result ?? '')) {
        res.status(400).json({ message: `Invalid result "${submitted.result}" for item ${tplItem.label}` });
        return;
      }
      if (tplItem.requires_photo && !submitted.photoUrl) {
        res.status(400).json({ message: `Photo is required for "${tplItem.label}"` });
        return;
      }
    }

    // Create the inspection.
    const inspectionId = randomUUID();
    const inspectorId = req.user.id;
    const overallResult = computeOverallResult(body.items);
    const now = new Date().toISOString();

    const inspection: Inspection = {
      id: inspectionId,
      asset_id: body.assetId,
      inspector_id: inspectorId,
      scheduled_date: body.scheduledDate,
      completed_at: now,
      overall_result: overallResult,
    };
    runtimeInspections.unshift(inspection);

    // Persist per-item rows.
    const runtimeItems = (req.app.get('inspectionItems') as Array<{
      id: string;
      inspection_id: string;
      checklist_template_item_id: string;
      result: string;
      notes: string | null;
      photo_url: string | null;
    }> | undefined) ?? [];
    for (const submitted of body.items) {
      runtimeItems.push({
        id: randomUUID(),
        inspection_id: inspectionId,
        checklist_template_item_id: submitted.checklistTemplateItemId!,
        result: submitted.result!,
        notes: submitted.notes ?? null,
        photo_url: submitted.photoUrl ?? null,
      });
    }
    req.app.set('inspectionItems', runtimeItems);

    // Write an audit log entry.
    const inspector: User | undefined = seedUsers.find((u) => u.id === inspectorId);
    runtimeAuditLogs.unshift({
      id: randomUUID(),
      user_id: inspectorId,
      action: 'inspection_submitted',
      entity_type: 'inspection',
      entity_id: inspectionId,
      metadata: { result: overallResult, assetCode: asset.asset_code, inspector: inspector?.full_name ?? null },
      created_at: now,
    });
    req.app.set('auditLogs', runtimeAuditLogs);

    // Notifications — BWF §14 events: inspection_due for the inspector
    // (inspection_assigned would fire here if a supervisor assigned to
    // another inspector; MVP flow has the inspector self-create.)
    runtimeNotifications.push({
      id: randomUUID(),
      user_id: inspectorId,
      type: 'inspection_due',
      message: `Inspection scheduled: ${asset.name} (${asset.asset_code}) on ${body.scheduledDate}`,
      entity_type: 'inspection',
      entity_id: inspectionId,
      read: false,
      created_at: now,
    });

    // Notify supervisors + plant managers of new inspection results
    const supervisorIds = seedUsers
      .filter((u) => u.role === 'supervisor' || u.role === 'plant_manager')
      .map((u) => u.id);
    for (const supId of supervisorIds) {
      if (supId === inspectorId) continue; // don't double-notify
      runtimeNotifications.push({
        id: randomUUID(),
        user_id: supId,
        type: 'inspection_completed',
        message: `Inspection completed: ${asset.name} (${asset.asset_code}) by ${inspector?.full_name ?? 'inspector'} — result: ${overallResult}`,
        entity_type: 'inspection',
        entity_id: inspectionId,
        read: false,
        created_at: now,
      });
    }

    res.status(201).json(toInspectionDto(inspection));
  },
};

/**
 * Helper exported for use by the plants/asset-types route group.
 */
export function plantsList() {
  return seedPlants;
}
export function assetTypesList() {
  return seedAssetTypes;
}
