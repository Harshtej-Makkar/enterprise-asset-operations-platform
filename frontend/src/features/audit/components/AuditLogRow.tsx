import { useNavigate } from 'react-router-dom';
import { ChevronRight, ScrollText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime } from '@/lib/utils';
import type { AuditLog } from '@/types/audit-log';

interface AuditLogRowProps {
  entry: AuditLog;
}

/**
 * Map an entityType to the in-app destination page. Returns null if
 * the entityType doesn't have a dedicated detail page (e.g. 'user'
 * has no detail route in MVP scope).
 */
function entityLink(entry: AuditLog): string | null {
  if (!entry.entityId) return null;
  switch (entry.entityType) {
    case 'inspection':
      return `/inspections/${entry.entityId}`;
    case 'defect':
      return `/defects/${entry.entityId}`;
    case 'work_order':
      return `/work-orders/${entry.entityId}`;
    case 'asset':
      return `/assets/${entry.entityId}`;
    case 'user':
    case 'approval':
    default:
      return null;
  }
}

/** Humanise an action string ("inspection_submitted" → "Inspection submitted"). */
function humaniseAction(action: string): string {
  return action
    .split('_')
    .map((p) => (p.length === 0 ? '' : p[0].toUpperCase() + p.slice(1)))
    .join(' ');
}

/**
 * Convert the entity type into a friendly noun ("defect" → "Defect").
 * Falls back to the raw value for any string we don't know.
 */
function entityNoun(entityType: AuditLog['entityType']): string {
  const map: Record<AuditLog['entityType'], string> = {
    inspection: 'Inspection',
    defect: 'Defect',
    work_order: 'Work order',
    asset: 'Asset',
    user: 'User',
    approval: 'Approval',
  };
  return map[entityType] ?? entityType;
}

/**
 * Variant for the action badge. Newer / safer events are info; we
 * reserve critical for the most destructive actions.
 */
function actionVariant(action: string): React.ComponentProps<typeof Badge>['variant'] {
  if (action === 'defect_approved' || action === 'work_order_completed') return 'success';
  if (action === 'defect_rejected') return 'warning';
  if (action === 'work_order_status_changed' || action === 'inspection_submitted') {
    return 'info';
  }
  return 'neutral';
}

/**
 * One audit log row. Read-only. Clicking a row whose entity has a
 * detail page navigates there.
 */
export function AuditLogRow({ entry }: AuditLogRowProps) {
  const navigate = useNavigate();
  const link = entityLink(entry);

  const handleClick = () => {
    if (link) navigate(link);
  };

  return (
    <div
      role={link ? 'button' : undefined}
      tabIndex={link ? 0 : -1}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (!link) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      className={cn(
        'group flex items-start gap-3 border-b border-border-default px-4 py-3 transition-colors last:border-b-0',
        link && 'cursor-pointer hover:bg-bg-elevated focus:bg-bg-elevated focus:outline-none',
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border-default bg-bg-elevated">
        <ScrollText className="h-4 w-4 text-text-secondary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-center gap-2">
          <Badge variant={actionVariant(entry.action)}>{humaniseAction(entry.action)}</Badge>
          <span className="text-caption text-text-muted">
            on {entityNoun(entry.entityType)}
          </span>
          <span className="ml-auto font-mono text-caption text-text-muted">
            {formatDateTime(entry.createdAt)}
          </span>
        </div>
        <div className="text-body text-text-primary">
          <span className="font-medium">{entry.userName ?? 'Unknown user'}</span>
          {entry.metadata && Object.keys(entry.metadata).length > 0 ? (
            <span className="text-text-secondary">
              {' '}
              — {humaniseMetadata(entry.metadata)}
            </span>
          ) : null}
        </div>
      </div>
      {link && (
        <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );
}

/** Best-effort pretty-printer for the metadata blob. */
function humaniseMetadata(meta: Record<string, unknown>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(meta)) {
    if (v === null || v === undefined || v === '') continue;
    parts.push(`${k} = ${typeof v === 'string' ? v : JSON.stringify(v)}`);
  }
  return parts.join(', ');
}
