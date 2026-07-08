import type { Request, Response } from 'express';
import { allDefects, allInspections, seedAssetTypes, seedPlants } from '../repositories/memory-store.js';
import type { Asset } from '../types/domain.js';
import { toDefectDto, toInspectionDto } from '../mappers/domain-dtos.js';

/**
 * Asset detail DTO — shape returned by GET /api/assets/:id. Defined
 * here (rather than in domain.ts) because it's a response shape, not
 * a database row.
 */
interface AssetDetail {
  id: string;
  assetCode: string;
  name: string;
  assetTypeId: string;
  plantId: string;
  department: string | null;
  status: string;
  createdAt: string;
  assetType?: { id: string; name: string };
  plant?: { id: string; name: string; city: string };
  inspectionCount?: number;
  defectCount?: number;
}

/**
 * Assets controller — list, detail, history.
 *
 * Pagination is real (limit/offset) per DMDD §14 — server-side only,
 * the client never receives the full set when there are more than
 * `pageSize` rows.
 *
 * The history endpoints (inspections, defects) MUST go through the
 * shared DTO mappers so the wire format is camelCase — matches the
 * frontend's TypeScript types and keeps the `accessorKey: 'createdAt'`
 * style working in TanStack Table columns.
 */

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parseIntParam(value: unknown, fallback: number, min = 1, max = Infinity): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function toAssetDto(a: Asset) {
  return {
    id: a.id,
    assetCode: a.asset_code,
    name: a.name,
    assetTypeId: a.asset_type_id,
    plantId: a.plant_id,
    department: a.department,
    status: a.status,
    createdAt: a.created_at,
  };
}

function toAssetDetailDto(a: Asset): AssetDetail {
  const type = seedAssetTypes.find((t) => t.id === a.asset_type_id);
  const plant = seedPlants.find((p) => p.id === a.plant_id);
  const inspections = allInspections().filter((i) => i.asset_id === a.id);
  const defects = allDefects().filter((d) => d.asset_id === a.id);
  return {
    ...toAssetDto(a),
    assetType: type ? { id: type.id, name: type.name } : undefined,
    plant: plant ? { id: plant.id, name: plant.name, city: plant.city } : undefined,
    inspectionCount: inspections.length,
    defectCount: defects.length,
  };
}

function applyFilters(
  rows: Asset[],
  q: { search?: string; plantId?: string; status?: string },
): Asset[] {
  let out = rows;
  if (q.search) {
    const needle = q.search.toLowerCase();
    out = out.filter(
      (a) => a.asset_code.toLowerCase().includes(needle) || a.name.toLowerCase().includes(needle),
    );
  }
  if (q.plantId) out = out.filter((a) => a.plant_id === q.plantId);
  if (q.status) out = out.filter((a) => a.status === q.status);
  return out;
}

export const assetsController = {
  /**
   * GET /api/assets
   * Query params: page (0-indexed), pageSize, search, plantId, status
   */
  list(req: Request, res: Response): void {
    const page = parseIntParam(req.query.page, 0, 0);
    const pageSize = parseIntParam(req.query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const search = typeof req.query.search === 'string' ? req.query.search : undefined;
    const plantId = typeof req.query.plantId === 'string' ? req.query.plantId : undefined;
    const status = typeof req.query.status === 'string' ? req.query.status : undefined;

    // Read from the runtime + seed combined list. For Week 2 the source
    // of truth is still the seed (no asset creation in Week 2), so this
    // is just the seed list — but the call site doesn't need to know.
    const allAssets = (req.app.get('assets') as Asset[] | undefined) ?? [];
    const filtered = applyFilters(allAssets, { search, plantId, status });
    const total = filtered.length;
    const start = page * pageSize;
    const slice = filtered.slice(start, start + pageSize);

    res.json({
      data: slice.map(toAssetDto),
      total,
      page,
      pageSize,
    });
  },

  /**
   * GET /api/assets/:id
   */
  get(req: Request, res: Response): void {
    const id = req.params.id;
    const allAssets = (req.app.get('assets') as Asset[] | undefined) ?? [];
    const asset = allAssets.find((a) => a.id === id);
    if (!asset) {
      res.status(404).json({ message: `Asset ${id} not found` });
      return;
    }
    res.json(toAssetDetailDto(asset));
  },

  /**
   * GET /api/assets/:id/inspections
   * Returns the inspection history for a single asset, newest first.
   * Intentionally NOT paginated — Asset Detail is a single-asset view
   * and we want all the rows on screen. Goes through `toInspectionDto`
   * so the response is camelCase (matches the frontend's TypeScript
   * types and the column accessorKeys on Asset Detail).
   */
  inspectionsForAsset(req: Request, res: Response): void {
    const id = req.params.id;
    const rows = allInspections()
      .filter((i) => i.asset_id === id)
      .sort((a, b) => b.scheduled_date.localeCompare(a.scheduled_date));
    res.json({ data: rows.map(toInspectionDto), total: rows.length });
  },

  /**
   * GET /api/assets/:id/defects
   * Returns the defect history for a single asset, newest first.
   * Goes through `toDefectDto` for the same camelCase reason.
   */
  defectsForAsset(req: Request, res: Response): void {
    const id = req.params.id;
    const rows = allDefects()
      .filter((d) => d.asset_id === id)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
    res.json({ data: rows.map(toDefectDto), total: rows.length });
  },
};
