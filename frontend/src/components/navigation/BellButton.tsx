import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { NotificationRow } from '@/features/notifications/components/NotificationRow';
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
} from '@/hooks/useNotifications';

/**
 * Bell button + popover/sheet for the top bar.
 *
 * Behaviour:
 *   - Bell shows the unread-count badge.
 *   - Click opens a right-side Sheet (desktop) or bottom sheet (mobile)
 *     containing the latest 20 notifications.
 *   - "Mark all read" button in the panel header.
 *   - "View all" link at the bottom jumps to /notifications.
 *   - Clicking a row marks it read + navigates, and closes the sheet
 *     (so the next time the user opens the bell the unread badge is
 *     accurate).
 */
const PREVIEW_LIMIT = 20;

export function BellButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Use the dedicated unread-count endpoint for the badge so it stays
  // cheap. Fall back to 0 if it errors.
  const { data: unread } = useUnreadCount();
  const unreadCount = unread?.count ?? 0;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Notifications (${unreadCount} unread)`}
        className="relative"
        onClick={() => setOpen(true)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="signal"
            className="absolute -right-1 -top-1 h-4 min-w-4 justify-center px-1 text-[10px]"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border-default px-4 py-3">
            <SheetTitle>Notifications</SheetTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/notifications')}
                onClickCapture={() => setOpen(false)}
                aria-label="View all notifications"
              >
                View all
              </Button>
              <MarkAllReadButton />
              <SheetClose
                className="ml-1 inline-flex h-7 w-7 items-center justify-center rounded-sm text-text-secondary hover:bg-bg-elevated hover:text-text-primary"
                aria-label="Close notifications"
              >
                ×
              </SheetClose>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NotificationPreview onNavigate={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function MarkAllReadButton() {
  const markAll = useMarkAllNotificationsRead();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Mark all as read"
      onClick={() => markAll.mutate()}
      disabled={markAll.isPending}
    >
      <CheckCheck className="h-4 w-4" />
    </Button>
  );
}

interface NotificationPreviewProps {
  /** Called when a row is clicked, so the parent can close the sheet. */
  onNavigate: () => void;
}

function NotificationPreview({ onNavigate }: NotificationPreviewProps) {
  const { data, isLoading, isError, error } = useNotifications({ limit: PREVIEW_LIMIT });
  const rows = data ?? [];

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 p-6 text-center">
        <p className="text-caption text-status-critical">
          {error instanceof Error ? error.message : 'Failed to load notifications.'}
        </p>
      </div>
    );
  }
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
        <Inbox className="h-8 w-8 text-text-muted" />
        <p className="text-body text-text-secondary">You're all caught up.</p>
      </div>
    );
  }
  return (
    <div>
      {rows.map((n) => (
        <NotificationRow key={n.id} notification={n} onNavigate={onNavigate} />
      ))}
    </div>
  );
}
