import type { Notification, NotificationType } from '@/types/notification';

/**
 * Map a notification to the in-app page that should open when the user
 * clicks it. The mapping is type-driven; the entity id is the
 * path-segment, so notifications about the same inspection open the
 * same Inspection Detail page, etc.
 *
 * Returns null when no sensible destination exists — the caller should
 * fall back to a non-clickable row in that case.
 */
export function notificationLink(n: Notification): string | null {
  const entityId = n.entityId;
  if (!entityId) return null;

  switch (n.entityType) {
    case 'inspection':
      return `/inspections/${entityId}`;
    case 'defect':
      return `/defects/${entityId}`;
    case 'work_order':
      return `/work-orders/${entityId}`;
    case 'asset':
      return `/assets/${entityId}`;
    case 'user':
    case null:
    case undefined:
    default:
      return null;
  }
}

/**
 * Human-readable label for the notification type, used in the small
 * eyebrow text on each row (e.g. "Critical defect", "Work order").
 * Kept here (not in the type module) so the type module stays a
 * data-only file.
 */
export function notificationTypeLabel(t: NotificationType): string {
  switch (t) {
    case 'inspection_due':
      return 'Inspection due';
    case 'inspection_overdue':
      return 'Inspection overdue';
    case 'defect_critical':
      return 'Critical defect';
    case 'work_order_assigned':
      return 'Work order assigned';
    case 'work_order_completed':
      return 'Work order completed';
    case 'approval_required':
      return 'Approval required';
    default:
      return t;
  }
}
