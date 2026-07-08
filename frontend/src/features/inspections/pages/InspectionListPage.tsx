import { type ColumnDef } from '@tanstack/react-table';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/forms/FilterPanel';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { useInspections } from '@/hooks/useInspections';
import type { Inspection } from '@/types/inspection';

const PAGE_SIZE = 10;

/**
 * Inspection List page (Week 2 build).
 *
 * Tablet-first per TRD §16 — Inspection Execution is one of the two
 * tablet-first modules (inspectors use tablets on the shop floor). The
 * layout is designed for a 768–1024px primary width, with a
 * graceful degradation to 375px mobile.
 */
export default function InspectionListPage() {
  const navigate = useNavigate();

  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  const inspectionsQuery = useInspections({ page, pageSize: PAGE_SIZE, status });

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      { value: 'pass', label: 'Pass' },
      { value: 'fail', label: 'Fail' },
      { value: 'pending', label: 'Pending' },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<Inspection, unknown>[]>(
    () => [
      {
        accessorKey: 'scheduledDate',
        header: 'Scheduled',
        cell: (info) => <span className="font-mono text-caption">{info.getValue() as string}</span>,
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
            <span className="font-mono text-caption text-text-secondary">{v.slice(0, 10)}</span>
          ) : (
            <span className="text-text-muted">—</span>
          );
        },
        size: 130,
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
        <div className="w-full sm:w-48">
          <SelectField
            label="Status"
            showLabel={false}
            name="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
            options={statusOptions}
          />
        </div>
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
