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
  /**
   * Joined on the server (toAuditLogDto) so the table can render the
   * actor's display name without a second round-trip. Optional because
   * older seed rows / mock data may not have it populated.
   */
  userName: string | null;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
