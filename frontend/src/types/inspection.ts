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

export interface Inspection {
  id: string;
  assetId: string;
  inspectorId: string;
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
