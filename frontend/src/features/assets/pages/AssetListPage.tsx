import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { StatusBadge } from '@/components/common/StatusBadge';
import { FilterPanel } from '@/components/forms/FilterPanel';
import { SearchInput } from '@/components/forms/SearchInput';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { useAssets, usePlants } from '@/hooks/useAssets';
import type { Asset } from '@/types/asset';

const PAGE_SIZE = 10;

/**
 * Asset List page (Week 2 build).
 *
 * Desktop-first per TRD §16 (Asset Registry is a management/desk-based task).
 * Uses the shared DataTable + FilterPanel and exercises real server-side
 * pagination + filtering through `useAssets` → `assetService.list`.
 */
export default function AssetListPage() {
  const navigate = useNavigate();

  // Filter + page state owned here. The hook sends the same values to the
  // backend; we don't do any client-side filtering.
  const [search, setSearch] = useState('');
  const [plantId, setPlantId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  const plantsQuery = usePlants();
  const assetsQuery = useAssets({ page, pageSize: PAGE_SIZE, search, plantId, status });

  // Plants for the filter dropdown — mapped to { value, label }
  const plantOptions = useMemo(
    () => [
      { value: '', label: 'All plants' },
      ...(plantsQuery.data?.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [plantsQuery.data],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'under_maintenance', label: 'Under Maintenance' },
      { value: 'retired', label: 'Retired' },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<Asset, unknown>[]>(
    () => [
      {
        accessorKey: 'assetCode',
        header: 'Code',
        cell: (info) => <span className="font-mono text-caption">{info.getValue() as string}</span>,
        size: 130,
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: (info) => <span className="font-medium">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'plantId',
        header: 'Plant',
        cell: (info) => {
          const pid = info.getValue() as string;
          const p = plantsQuery.data?.data.find((pl) => pl.id === pid);
          return p ? p.name : <span className="text-text-muted">—</span>;
        },
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: (info) => (info.getValue() ?? <span className="text-text-muted">—</span>) as React.ReactNode,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
        size: 160,
      },
    ],
    [plantsQuery.data],
  );

  // Reset to page 0 whenever any filter changes (the previously-shown page
  // may not exist in the new filtered result set).
  const handleSearchChange = (next: string) => {
    setSearch(next);
    setPage(0);
  };
  const handlePlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlantId(e.target.value);
    setPage(0);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(0);
  };
  const handleReset = () => {
    setSearch('');
    setPlantId('');
    setStatus('');
    setPage(0);
  };

  // Error state — show the placeholder, not a crash.
  if (assetsQuery.isError) {
    return (
      <PagePlaceholder
        title="Asset Registry"
        description="Could not load assets. Please try again."
        week=""
        bullets={['There was a problem contacting the API.']}
      />
    );
  }

  const data = assetsQuery.data?.data ?? [];
  const total = assetsQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Asset Registry"
        description={`${total} ${total === 1 ? 'asset' : 'assets'} across all plants. Click a row to view detail.`}
        eyebrow="Assets"
      />

      <FilterPanel
        actions={
          <Button variant="secondary" size="md" onClick={handleReset}>
            Reset
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by code or name…"
        />
        <div className="w-full sm:w-48">
          <SelectField
            label="Plant"
            showLabel={false}
            name="plantId"
            value={plantId}
            onChange={handlePlantChange}
            options={plantOptions}
          />
        </div>
        <div className="w-full sm:w-48">
          <SelectField
            label="Status"
            showLabel={false}
            name="status"
            value={status}
            onChange={handleStatusChange}
            options={statusOptions}
          />
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={data}
        isLoading={assetsQuery.isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
        onRowClick={(asset) => navigate(`/assets/${asset.id}`)}
        emptyState="No assets match these filters."
      />
    </div>
  );
}
