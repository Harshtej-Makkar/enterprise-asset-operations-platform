import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatDateTime } from '@/lib/utils';
import type { Notification } from '@/types/notification';
import { notificationLink, notificationTypeLabel } from '../notification-link';
import { useMarkNotificationRead } from '@/hooks/useNotifications';

interface NotificationRowProps {
  notification: Notification;
  /**
   * Optional override: when provided, click navigates here instead of
   * the type-derived link. Used by the bell popover to keep the user
   * on the current page if the link is the same.
   */
  onNavigate?: () => void;
}

/**
 * Single notification row used by both the Notifications page and the
 * TopBar bell popover. Visual style is identical to the audit log
 * timeline row, except the trailing column is a "Mark read" action
 * when the row is unread, or a chevron when it has a click-through
 * destination.
 */
export function NotificationRow({ notification: n, onNavigate }: NotificationRowProps) {
  const navigate = useNavigate();
  const markRead = useMarkNotificationRead();
  const link = notificationLink(n);

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
      return;
    }
    if (link) navigate(link);
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (n.read) return;
    markRead.mutate(n.id);
  };

  const variant =
    n.type === 'defect_critical' || n.type === 'approval_required'
      ? 'critical'
      : n.type === 'inspection_overdue' || n.type === 'work_order_assigned'
        ? 'warning'
        : n.type === 'work_order_completed' || n.type === 'defect_approved'
          ? 'success'
          : n.type === 'defect_rejected'
            ? 'critical'
            : 'info';

  return (
    <div
      role={link ? 'button' : undefined}
      tabIndex={link ? 0 : -1}
      onClick={handleNavigate}
      onKeyDown={(e) => {
        if (!link) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
      className={cn(
        'group flex items-start gap-3 border-b border-border-default px-4 py-3 transition-colors last:border-b-0',
        link && 'cursor-pointer hover:bg-bg-elevated focus:bg-bg-elevated focus:outline-none',
        !n.read && 'bg-[rgba(91,141,239,0.04)]',
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-sm border border-border-default bg-bg-elevated">
        <Bell className="h-4 w-4 text-text-secondary" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <Badge variant={variant}>{notificationTypeLabel(n.type)}</Badge>
          {!n.read && (
            <span
              className="inline-block h-1.5 w-1.5 rounded-pill bg-status-info"
              aria-label="Unread"
            />
          )}
          <span className="ml-auto font-mono text-caption text-text-muted">
            {formatDateTime(n.createdAt)}
          </span>
        </div>
        <div className={cn('text-body text-text-primary', !n.read && 'font-medium')}>
          {n.message}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {!n.read && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Mark as read"
            onClick={handleMarkRead}
            disabled={markRead.isPending}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        {link && !onNavigate && (
          <ChevronRight className="h-4 w-4 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
        )}
      </div>
    </div>
  );
}
