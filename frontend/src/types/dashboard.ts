export interface DashboardKpis {
  totalAssets: number;
  pendingInspections: number;
  openDefects: number;
  criticalDefectsAwaitingApproval: number;
  openWorkOrders: number;
  inspectionCompletionRate: number; // percentage 0-100
  assetHealthSummary: {
    healthy: number;
    needsAttention: number;
    critical: number;
  };
}

export interface RecentActivityItem {
  id: string;
  type: 'inspection' | 'defect' | 'work_order' | 'approval';
  message: string;
  userName: string;
  createdAt: string;
}

/**
 * One bucket in the 30-day inspections trend series returned by
 * GET /api/dashboard/trends. Counts inspections completed on the given
 * date, broken down by result.
 */
export interface InspectionsByDayBucket {
  date: string; // YYYY-MM-DD
  pass: number;
  fail: number;
  pending: number;
}

/**
 * Defect severity snapshot returned by GET /api/dashboard/trends.
 * Total counts across all assets, broken down by severity.
 */
export interface DefectsBySeverity {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

export interface DashboardTrends {
  inspectionsByDay: InspectionsByDayBucket[];
  defectsBySeverity: DefectsBySeverity;
}
