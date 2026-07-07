export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'completed';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkOrder {
  id: string;
  defectId: string;
  assignedTo: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  deadline: string | null;
  createdAt: string;
}

export interface MaintenanceUpdate {
  id: string;
  workOrderId: string;
  technicianId: string;
  note: string;
  statusChangeTo: WorkOrderStatus | null;
  createdAt: string;
}
