import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { FilterPanel } from '@/components/forms/FilterPanel';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { useDefects } from '@/hooks/useDefects';
import { usePlants } from '@/hooks/useAssets';
import type { Defect } from '@/types/defect';

const PAGE_SIZE = 10;

export default function DefectListPage() {
  const navigate = useNavigate();

  const [severity, setSeverity] = useState('');
  const [status, setStatus] = useState('');
  const [plantId, setPlantId] = useState('');
  const [page, setPage] = useState(0);

  const plantsQuery = usePlants();
  const defectsQuery = useDefects({
    page,
    pageSize: PAGE_SIZE,
    severity: severity || undefined,
    status: status || undefined,
    plantId: plantId || undefined,
  });

  const plantOptions = useMemo(
    () => [
      { value: '', label: 'All plants' },
      ...(plantsQuery.data?.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [plantsQuery.data],
  );

  const severityOptions = useMemo(
    () => [
      { value: '', label: 'All severities' },
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'critical', label: 'Critical' },
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: '', label: 'All statuses' },
      { value: 'open', label: 'Open' },
      { value: 'pending_approval', label: 'Pending Approval' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
      { value: 'work_order_created', label: 'Work Order Created' },
      { value: 'resolved', label: 'Resolved' },
    ],
    [],
  );

  const columns = useMemo<ColumnDef<Defect, unknown>[]>(
    () => [
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => {
          const desc = info.getValue() as string;
          return (
            <span className="line-clamp-1 max-w-64" title={desc}>
              {desc}
            </span>
          );
        },
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: (info) => {
          const s = info.getValue() as string;
          const colors: Record<string, string> = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            critical: 'bg-red-100 text-red-800',
          };
          return (
            <span
              className={`inline-block rounded-sm px-2 py-0.5 text-caption font-medium ${colors[s] ?? 'bg-neutral-100 text-text-secondary'}`}
            >
              {s}
            </span>
          );
        },
        size: 100,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => {
          const s = info.getValue() as string;
          const label = s.replace(/_/g, ' ');
          return <span className="text-caption capitalize text-text-secondary">{label}</span>;
        },
        size: 150,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => <span className="text-caption">{info.getValue() as string}</span>,
        size: 130,
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: (info) => {
          const d = new Date(info.getValue() as string);
          return <span className="text-caption text-text-secondary">{d.toLocaleDateString()}</span>;
        },
        size: 120,
      },
    ],
    [],
  );

  const handleSeverityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSeverity(e.target.value);
    setPage(0);
  };
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value);
    setPage(0);
  };
  const handlePlantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPlantId(e.target.value);
    setPage(0);
  };
  const handleReset = () => {
    setSeverity('');
    setStatus('');
    setPlantId('');
    setPage(0);
  };

  if (defectsQuery.isError) {
    return (
      <PagePlaceholder
        title="Defects"
        description="Could not load defects. Please try again."
        week="Week 3"
        bullets={[
          'Severity filter',
          'Status filter',
          'Plant filter',
          'Approval action for Critical defects',
        ]}
      />
    );
  }

  const data = defectsQuery.data?.data ?? [];
  const total = defectsQuery.data?.total ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Defects"
        description={`${total} ${total === 1 ? 'defect' : 'defects'} — filter by severity, status, and plant. Click a row to view details or approve.`}
        eyebrow="Quality"
      />

      <div className="flex items-center justify-between">
        <FilterPanel
          actions={
            <Button variant="secondary" size="md" onClick={handleReset}>
              Reset
            </Button>
          }
        >
          <div className="w-full sm:w-48">
            <SelectField
              label="Severity"
              showLabel={false}
              name="severity"
              value={severity}
              onChange={handleSeverityChange}
              options={severityOptions}
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
        </FilterPanel>
        <Button size="sm" onClick={() => navigate('/defects/new')} className="gap-1.5">
          <Plus className="h-4 w-4" /> Log Defect
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        isLoading={defectsQuery.isLoading}
        pagination={{
          page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
        onRowClick={(defect) => navigate(`/defects/${defect.id}`)}
        emptyState="No defects match these filters."
      />
    </div>
  );
}