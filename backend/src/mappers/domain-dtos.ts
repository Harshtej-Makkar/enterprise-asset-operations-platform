import { seedAssetTypes, seedAssets, seedPlants, seedUsers } from '../repositories/memory-store.js';
import type { Asset, Defect, Inspection, User } from '../types/domain.js';

/**
 * DTO mappers shared between controllers.
 *
 * These are the single source of truth for the camelCase response shape
 * sent over the wire. Every endpoint that returns an Inspection or Defect
 * MUST go through these mappers — never return raw domain rows. Domain
 * rows use snake_case (matches the Postgres schema); the wire format is
 * camelCase (matches the frontend's TypeScript types).
 *
 * If a new field is added to a domain type, add the camelCase mapping
 * here so every consumer gets the same shape.
 */

/**
 * Subset of an asset's plant, joined onto the inspection DTO. Same shape
 * the asset detail DTO exposes, so consumers can read `plant.name` /
 * `plant.city` directly without a second round-trip.
 */
export interface InspectionAssetPlantRef {
  id: string;
  name: string;
  city: string;
}

/**
 * Subset of an asset, joined onto the inspection DTO. Includes the plant
 * reference (the canonical "where is this asset" answer) and the asset
 * type name (so list views can show "Hydraulic Press" without joining).
 */
export interface InspectionAssetRef {
  id: string;
  assetCode: string;
  name: string;
  plant: InspectionAssetPlantRef | null;
  assetTypeName: string | null;
}

/**
 * Inspection DTO. Includes the embedded asset and inspector references
 * that the list endpoint joins, so the frontend doesn't need a second
 * round-trip just to render the list.
 */
export interface InspectionDto {
  id: string;
  assetId: string;
  asset: InspectionAssetRef | null;
  inspectorId: string;
  inspector: { id: string; fullName: string } | null;
  scheduledDate: string;
  completedAt: string | null;
  overallResult: Inspection['overall_result'];
}

export function toInspectionDto(i: Inspection): InspectionDto {
  const asset: Asset | undefined = seedAssets.find((a) => a.id === i.asset_id);
  const inspector = seedUsers.find((u) => u.id === i.inspector_id);
  let assetDto: InspectionAssetRef | null = null;
  if (asset) {
    const plant = seedPlants.find((p) => p.id === asset.plant_id);
    const type = seedAssetTypes.find((t) => t.id === asset.asset_type_id);
    assetDto = {
      id: asset.id,
      assetCode: asset.asset_code,
      name: asset.name,
      plant: plant ? { id: plant.id, name: plant.name, city: plant.city } : null,
      assetTypeName: type ? type.name : null,
    };
  }
  return {
    id: i.id,
    assetId: i.asset_id,
    asset: assetDto,
    inspectorId: i.inspector_id,
    inspector: inspector ? { id: inspector.id, fullName: inspector.full_name } : null,
    scheduledDate: i.scheduled_date,
    completedAt: i.completed_at,
    overallResult: i.overall_result,
  };
}

/**
 * Defect DTO. No embedded joins (the frontend renders the defect with
 * status/severity badges and shows the parent asset via the page context).
 */
export interface DefectDto {
  id: string;
  assetId: string;
  inspectionId: string | null;
  reportedBy: string;
  reporterName: string | null;
  severity: Defect['severity'];
  category: string;
  description: string;
  photoUrls: string[];
  status: Defect['status'];
  createdAt: string;
}

export function toDefectDto(d: Defect): DefectDto {
  const reporter: User | undefined = seedUsers.find((u) => u.id === d.reported_by);
  return {
    id: d.id,
    assetId: d.asset_id,
    inspectionId: d.inspection_id,
    reportedBy: d.reported_by,
    reporterName: reporter ? reporter.full_name : null,
    severity: d.severity,
    category: d.category,
    description: d.description,
    photoUrls: d.photo_urls,
    status: d.status,
    createdAt: d.created_at,
  };
}
