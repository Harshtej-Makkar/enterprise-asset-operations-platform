export type NotificationType =
  | 'inspection_due'
  | 'inspection_overdue'
  | 'defect_critical'
  | 'work_order_assigned'
  | 'work_order_completed'
  | 'approval_required';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
}
