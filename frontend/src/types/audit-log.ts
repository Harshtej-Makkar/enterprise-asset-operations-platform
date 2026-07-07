export type AuditEntityType =
  | 'inspection'
  | 'defect'
  | 'approval'
  | 'work_order'
  | 'asset'
  | 'user';

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
