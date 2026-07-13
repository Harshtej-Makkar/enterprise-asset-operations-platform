export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'completed';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkOrderDefect {
  id: string;
  description: string;
  severity: string;
  category: string;
}

export interface WorkOrderAsset {
  id: string;
  assetCode: string;
  name: string;
  plantName: string | null;
}

export interface WorkOrderNote {
  id: string;
  technicianId: string;
  technicianName: string | null;
  note: string;
  statusChangeTo: WorkOrderStatus | null;
  createdAt: string;
}

export interface WorkOrder {
  id: string;
  defectId: string;
  defect: WorkOrderDefect | null;
  assignedTo: string | null;
  assigneeName: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  deadline: string | null;
  createdAt: string;
}

export interface WorkOrderDetail extends WorkOrder {
  asset: WorkOrderAsset | null;
  notes: WorkOrderNote[];
}

export interface MaintenanceUpdate {
  id: string;
  workOrderId: string;
  technicianId: string;
  note: string;
  statusChangeTo: WorkOrderStatus | null;
  createdAt: string;
}