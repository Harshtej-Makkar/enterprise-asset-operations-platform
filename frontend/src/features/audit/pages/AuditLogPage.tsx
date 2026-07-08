import { useMemo, useState } from 'react';
import { ScrollText, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { AuditLogRow } from '../components/AuditLogRow';
import { useAuditActions, useAuditLog, useAuditUsers } from '@/hooks/useAuditLog';
import { cn, formatDate } from '@/lib/utils';

const PAGE_SIZE = 25;
const ENTITY_TYPES = [
  { value: '', label: 'All entity types' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'defect', label: 'Defect' },
  { value: 'work_order', label: 'Work order' },
  { value: 'asset', label: 'Asset' },
  { value: 'user', label: 'User' },
  { value: 'approval', label: 'Approval' },
];

/**
 * Audit Log page.
 *
 * Read-only chronological timeline of state-changing actions across
 * the platform. Filters: entity type, user, action, and date range.
 * Clicking a row whose entity has a detail page navigates to it
 * (inspection → /inspections/:id, defect → /defects/:id, …). Entries
 * without a destination are non-clickable.
 */
export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const [entityType, setEntityType] = useState('');
  const [userId, setUserId] = useState('');
  const [action, setAction] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filters = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      entityType: entityType || undefined,
      userId: userId || undefined,
      action: action || undefined,
      from: from || undefined,
      to: to || undefined,
    }),
    [page, entityType, userId, action, from, to],
  );

  const { data, isLoading, isError, error, refetch, isFetching } = useAuditLog(filters);
  const actionsQuery = useAuditActions();
  const usersQuery = useAuditUsers();

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const hasFilters = !!(entityType || userId || action || from || to);
  const reset = () => {
    setEntityType('');
    setUserId('');
    setAction('');
    setFrom('');
    setTo('');
    setPage(0);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Log"
        description="Read-only chronological timeline of state-changing actions across the platform. Newest first."
        eyebrow="Audit log"
      />

      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-3 rounded-sm border border-border-default bg-bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <FilterField label="Entity type">
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            {ENTITY_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="User">
          <select
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="">All users</option>
            {(usersQuery.data ?? []).map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.eventCount})
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Action">
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="">All actions</option>
            {(actionsQuery.data ?? []).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField label="From">
          <Input
            type="date"
            value={from}
            onChange={(e) => {
              setFrom(e.target.value);
              setPage(0);
            }}
            className="font-mono text-caption"
          />
        </FilterField>

        <FilterField label="To">
          <Input
            type="date"
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setPage(0);
            }}
            className="font-mono text-caption"
          />
        </FilterField>
      </div>

      {hasFilters && (
        <div className="flex items-center justify-between">
          <div className="text-caption text-text-secondary">
            {isFetching ? 'Refreshing…' : `${total} ${total === 1 ? 'event' : 'events'} match the active filters`}
          </div>
          <Button variant="ghost" size="sm" onClick={reset}>
            <X className="mr-1.5 h-3.5 w-3.5" />
            Clear filters
          </Button>
        </div>
      )}

      <div className="overflow-hidden rounded-sm border border-border-default bg-bg-surface">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <p className="text-body text-status-critical">
              {error instanceof Error ? error.message : 'Failed to load audit log.'}
            </p>
            <Button variant="outline" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <ScrollText className="h-8 w-8 text-text-muted" />
            <p className="text-body text-text-secondary">
              {hasFilters
                ? 'No events match the active filters.'
                : "No events have been recorded yet. They'll appear here as users take state-changing actions."}
            </p>
          </div>
        ) : (
          <div>
            {rows.map((row) => (
              <AuditLogRow key={row.id} entry={row} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="font-mono text-caption text-text-muted">
            Page {page + 1} of {totalPages} · {total} total
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Date range footnote */}
      {(from || to) && (
        <p className="text-caption text-text-muted">
          Showing events between{' '}
          <span className="font-mono">{formatDate(from) || '…'}</span> and{' '}
          <span className="font-mono">{formatDate(to) || '…'}</span>.
        </p>
      )}
    </div>
  );
}

const selectClass = cn(
  'h-9 w-full rounded-sm border border-border-default bg-bg-elevated px-2 text-body text-text-primary',
  'focus:outline-none focus:ring-1 focus:ring-status-info',
);

function FilterField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-caption uppercase tracking-wider text-text-secondary">
        {label}
      </span>
      {children}
    </label>
  );
}
