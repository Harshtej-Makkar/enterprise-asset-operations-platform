export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

export type DefectStatus =
  | 'open'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'work_order_created'
  | 'resolved';

export type ApprovalDecision = 'approved' | 'rejected';

export interface Defect {
  id: string;
  assetId: string;
  inspectionId: string | null;
  reportedBy: string;
  severity: DefectSeverity;
  category: string;
  description: string;
  photoUrls: string[];
  status: DefectStatus;
  createdAt: string;
}

export interface Approval {
  id: string;
  defectId: string;
  approverId: string;
  decision: ApprovalDecision;
  comment: string | null;
  decidedAt: string;
}
