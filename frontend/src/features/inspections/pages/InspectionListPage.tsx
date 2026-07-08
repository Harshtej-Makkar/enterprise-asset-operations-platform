import { type ColumnDef } from '@tanstack/react-table';
import { Plus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/forms/FilterPanel';
import { Button } from '@/components/ui/button';
import { useInspections } from '@/hooks/useInspections';
import { formatDate, formatDateTime } from '@/lib/utils';
import type { Inspection } from '@/types/inspection';

const PAGE_SIZE = 10;

type InspectionStatus = 'pass' | 'fail' | 'pending';

const ALL_STATUSES: InspectionStatus[] = ['pass', 'fail', 'pending'];

const STATUS_LABELS: Record<InspectionStatus, string> = {
  pass: 'Pass',
  fail: 'Fail',
  pending: 'Pending',
};

/**
 * Inspection List page (Week 2 build).
 *
 * Tablet-first per TRD §16 — Inspection Execution is one of the two
 * tablet-first modules (inspectors use tablets on the shop floor). The
 * layout is designed for a 768–1024px primary width, with a
 * graceful degradation to 375px mobile.
 *
 * Supports multi-select status filter and date-range filter via URL
 * search params (`?from=YYYY-MM-DD&to=YYYY-MM-DD&status=pass,fail`),
 * driven by the Dashboard chart bar-click navigation (Week 5a).
 */
export default function InspectionListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- Derive filter state from URL search params ----------------------
  const from = searchParams.get('from') || undefined;
  const to = searchParams.get('to') || undefined;
  const statusParam = searchParams.get('status') || '';
  const activeStatuses: InspectionStatus[] = statusParam
    ? (statusParam.split(',').filter((s) => ALL_STATUSES.includes(s as InspectionStatus)) as InspectionStatus[])
    : [];

  const [page, setPage] = useState(0);

  // --- API query -------------------------------------------------------
  const statusQuery = activeStatuses.length > 0 && activeStatuses.length < 3
    ? activeStatuses.join(',')
    : undefined;

  const inspectionsQuery = useInspections({
    page,
    pageSize: PAGE_SIZE,
    status: statusQuery,
    from,
    to,
  });

  // --- Date-range chip helpers -----------------------------------------
  const hasDateFilter = Boolean(from || to);

  function clearDateFilter() {
    const next = new URLSearchParams(searchParams);
    next.delete('from');
    next.delete('to');
    setSearchParams(next, { replace: true });
    setPage(0);
  }

  // --- Status checkbox helpers -----------------------------------------
  function toggleStatus(s: InspectionStatus) {
    const next = new URLSearchParams(searchParams);
    const set = new Set(activeStatuses);
    if (set.has(s)) set.delete(s); else set.add(s);
    if (set.size === 0 || set.size === ALL_STATUSES.length) {
      next.delete('status');
    } else {
      next.set('status', [...set].join(','));
    }
    setSearchParams(next, { replace: true });
    setPage(0);
  }

  // --- Columns ---------------------------------------------------------
  const columns = useMemo<ColumnDef<Inspection, unknown>[]>(
    () => [
      {
        accessorKey: 'scheduledDate',
        header: 'Scheduled',
        cell: (info) => (
          <span className="font-mono text-caption">{formatDate(info.getValue() as string)}</span>
        ),
        size: 130,
      },
      {
        id: 'asset',
        header: 'Asset',
        accessorFn: (row) => row.asset?.assetCode ?? '—',
        cell: (info) => {
          const row = info.row.original;
          if (row.asset) {
            return (
              <Link
                to={`/assets/${row.asset.id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-mono text-caption text-status-info hover:underline"
              >
                {row.asset.assetCode} · {row.asset.name}
              </Link>
            );
          }
          return <span className="text-text-muted">—</span>;
        },
      },
      {
        id: 'inspector',
        header: 'Inspector',
        accessorFn: (row) => row.inspector?.fullName ?? '',
        cell: (info) => {
          const i = info.row.original.inspector;
          return i ? i.fullName : <span className="text-text-muted">—</span>;
        },
      },
      {
        accessorKey: 'overallResult',
        header: 'Result',
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
        size: 110,
      },
      {
        accessorKey: 'completedAt',
        header: 'Completed',
        cell: (info) => {
          const v = info.getValue() as string | null;
          return v ? (
            <span className="font-mono text-caption text-text-secondary">{formatDateTime(v)}</span>
          ) : (
            <span className="text-text-muted">—</span>
          );
        },
        size: 150,
      },
    ],
    [],
  );

  const data = inspectionsQuery.data?.data ?? [];
  const total = inspectionsQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections"
        description={`${total} ${total === 1 ? 'inspection' : 'inspections'} across all assets.`}
        eyebrow="Inspections"
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/inspections/new')}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" /> New Inspection
          </Button>
        }
      />

      <FilterPanel>
        {/* Status multi-select */}
        <fieldset className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <legend className="sr-only">Filter by inspection result</legend>
          {ALL_STATUSES.map((s) => (
            <label
              key={s}
              className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-caption text-text-secondary hover:text-text-primary"
            >
              <input
                type="checkbox"
                checked={activeStatuses.includes(s)}
                onChange={() => toggleStatus(s)}
                className="size-3.5 accent-accent-primary"
              />
              {STATUS_LABELS[s]}
            </label>
          ))}
        </fieldset>

        {/* Date-range chip (from dashboard navigation) */}
        {hasDateFilter && (
          <span className="inline-flex items-center gap-1 rounded-sm border border-border-default bg-bg-surface px-2 py-0.5 font-mono text-caption text-text-secondary">
            {from && to && from === to
              ? formatDate(from)
              : `${from ? formatDate(from) : '…'} – ${to ? formatDate(to) : '…'}`}
            <button
              type="button"
              onClick={clearDateFilter}
              className="ml-0.5 text-text-muted hover:text-text-primary"
              aria-label="Clear date filter"
            >
              <X className="size-3" />
            </button>
          </span>
        )}
      </FilterPanel>

      <DataTable
        columns={columns}
        data={data}
        isLoading={inspectionsQuery.isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
        onRowClick={(row) => navigate(`/inspections/${row.id}`)}
        emptyState="No inspections match these filters."
      />
    </div>
  );
}