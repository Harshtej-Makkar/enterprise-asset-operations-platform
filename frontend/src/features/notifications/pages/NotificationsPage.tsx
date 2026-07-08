import { useState } from 'react';
import { Inbox, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SegmentedToggle, type SegmentedOption } from '@/components/common/SegmentedToggle';
import { NotificationRow } from '../components/NotificationRow';
import {
  useMarkAllNotificationsRead,
  useNotifications,
} from '@/hooks/useNotifications';

type ReadFilter = 'all' | 'unread' | 'read';

const FILTER_OPTIONS: SegmentedOption<ReadFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
];

/**
 * Notifications page.
 *
 * Lists the current user's notifications, newest first. Three filter
 * states (all / unread / read) drive the request. Clicking a row
 * navigates to the linked entity (inspection, defect, work order, …)
 * AND marks the row as read in the same interaction. The "Mark all
 * read" button in the header is a no-op when there are no unread rows.
 *
 * Polling: 60s, per PRD §6. The hook is the single source of truth
 * for the unread badge in the top bar (both use the same query key).
 */
export default function NotificationsPage() {
  const [filter, setFilter] = useState<ReadFilter>('all');
  const apiRead =
    filter === 'unread' ? ('false' as const) : filter === 'read' ? ('true' as const) : undefined;

  const { data, isLoading, isError, error, refetch } = useNotifications(
    apiRead ? { read: apiRead, limit: 200 } : { limit: 200 },
  );
  const markAll = useMarkAllNotificationsRead();

  const rows = data ?? [];
  const unreadCount = rows.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Lightweight panel for inspection due/overdue, critical defects, and work order events. Newest first; polling every 60 seconds."
        eyebrow="Notifications"
        actions={
          <Button
            variant="outline"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending || unreadCount === 0}
            aria-label="Mark all notifications as read"
          >
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all read
            {unreadCount > 0 && (
              <Badge variant="info" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </Button>
        }
      />

      <div className="flex items-center justify-between">
        <SegmentedToggle
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter notifications by read state"
        />
        <span className="font-mono text-caption uppercase tracking-wider text-text-muted">
          {isLoading ? 'Loading…' : `${rows.length} ${rows.length === 1 ? 'item' : 'items'}`}
        </span>
      </div>

      <div className="overflow-hidden rounded-sm border border-border-default bg-bg-surface">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : rows.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div>
            {rows.map((n) => (
              <NotificationRow key={n.id} notification={n} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ filter }: { filter: ReadFilter }) {
  const message =
    filter === 'unread'
      ? "You're all caught up — no unread notifications."
      : filter === 'read'
        ? 'No read notifications yet.'
        : "You don't have any notifications yet. They'll appear here as the inspection, defect, and work-order flows generate events.";
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <Inbox className="h-8 w-8 text-text-muted" />
      <p className="text-body text-text-secondary">{message}</p>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const message = error instanceof Error ? error.message : 'Failed to load notifications.';
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <p className="text-body text-status-critical">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}
