/**
 * Domain types — kept in lock-step with frontend/src/types/*.ts.
 * Single source of truth lives in reference/08-Data-Model-Database-Design.md.
 */

export type UserRole = 'admin' | 'plant_manager' | 'supervisor' | 'inspector' | 'technician';

export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  plant_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Plant {
  id: string;
  name: string;
  city: string;
  address: string | null;
  status: 'active' | 'inactive';
}

export interface Asset {
  id: string;
  asset_code: string;
  name: string;
  asset_type_id: string;
  plant_id: string;
  department: string | null;
  status: 'active' | 'inactive' | 'under_maintenance' | 'retired';
  created_at: string;
}

export type InspectionResult = 'pass' | 'fail' | 'na' | 'pending';
export type OverallResult = 'pass' | 'fail' | 'pending';

export interface Inspection {
  id: string;
  asset_id: string;
  inspector_id: string;
  scheduled_date: string;
  completed_at: string | null;
  overall_result: OverallResult;
}

export interface InspectionItem {
  id: string;
  inspection_id: string;
  checklist_template_item_id: string;
  result: InspectionResult;
  notes: string | null;
  photo_url: string | null;
}

export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';
export type DefectStatus =
  | 'open'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'work_order_created'
  | 'resolved';

export interface Defect {
  id: string;
  asset_id: string;
  inspection_id: string | null;
  reported_by: string;
  severity: DefectSeverity;
  category: string;
  description: string;
  photo_urls: string[];
  status: DefectStatus;
  created_at: string;
}

export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'completed';
export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WorkOrder {
  id: string;
  defect_id: string;
  assigned_to: string | null;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  deadline: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  read: boolean;
  created_at: string;
}
