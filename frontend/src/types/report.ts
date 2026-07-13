export type ReportType = 'inspection' | 'defect' | 'maintenance' | 'compliance';

/** Input shape for POST /reports/generate */
export interface ReportFilter {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  plantId?: string;
}

/** Summary row returned by GET /reports (list) — excludes the heavy `data` payload */
export interface ReportListItem {
  id: string;
  type: ReportType;
  dateFrom: string | null;
  dateTo: string | null;
  plantId: string | null;
  generatedAt: string;
  generatedBy: string;
}

/** Full report returned by GET /reports/:id and POST /reports/generate */
export interface GeneratedReport {
  id: string;
  type: ReportType;
  dateFrom: string | null;
  dateTo: string | null;
  plantId: string | null;
  generatedAt: string;
  generatedBy: string;
  data: ReportData;
}

export interface ReportData {
  summary: Record<string, unknown>;
  rows: Record<string, unknown>[];
  /** Only present for compliance reports */
  complianceScore?: number | null;
  complianceBreakdown?: ComplianceBreakdown;
}

export interface ComplianceBreakdown {
  inspectionTimeliness: IndicatorResult;
  criticalDefectResolution: IndicatorResult;
  workOrderFlowHealth: IndicatorResult;
  message?: string;
}

export interface IndicatorResult {
  label: string;
  numerator: number;
  denominator: number;
  score: number | null;
  note?: string;
}