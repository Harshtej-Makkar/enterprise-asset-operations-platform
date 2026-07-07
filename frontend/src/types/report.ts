export type ReportType = 'inspection' | 'defect' | 'maintenance' | 'compliance';

export interface ReportFilter {
  type: ReportType;
  dateFrom?: string;
  dateTo?: string;
  plantId?: string;
  severity?: string;
  status?: string;
}
