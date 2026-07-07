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
