export type InspectionResult = 'pass' | 'fail' | 'na' | 'pending';
export type OverallResult = 'pass' | 'fail' | 'pending';

export interface ChecklistTemplate {
  id: string;
  assetTypeId: string;
}

export interface ChecklistTemplateItem {
  id: string;
  checklistTemplateId: string;
  label: string;
  orderIndex: number;
  requiresPhoto: boolean;
}

/**
 * Embedded user reference — the backend joins the inspector onto the
 * inspection DTO so the list/detail pages don't need a second round-trip.
 */
export interface InspectionUserRef {
  id: string;
  fullName: string;
}

/**
 * Embedded plant reference on an inspection's asset. Used by the
 * Inspection Detail page to render the plant without a second round-trip
 * (same pattern as Asset Detail's `plant` join).
 */
export interface InspectionAssetPlantRef {
  id: string;
  name: string;
  city: string;
}

/**
 * Embedded asset reference — the backend joins the parent asset onto the
 * inspection DTO so the inspection list/detail pages can show the asset
 * name, plant, and asset type without a separate fetch.
 */
export interface InspectionAssetRef {
  id: string;
  assetCode: string;
  name: string;
  plant: InspectionAssetPlantRef | null;
  assetTypeName: string | null;
}

export interface Inspection {
  id: string;
  assetId: string;
  /** Present in list responses (joined by backend). */
  asset?: InspectionAssetRef | null;
  inspectorId: string;
  /** Present in list responses (joined by backend). */
  inspector?: InspectionUserRef | null;
  scheduledDate: string;
  completedAt: string | null;
  overallResult: OverallResult;
}

export interface InspectionItem {
  id: string;
  inspectionId: string;
  checklistTemplateItemId: string;
  result: InspectionResult;
  notes: string | null;
  photoUrl: string | null;
}
