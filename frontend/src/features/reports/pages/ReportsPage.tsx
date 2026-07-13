import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ClipboardCheck,
  AlertTriangle,
  Wrench,
  ShieldCheck,
  Download,
  Loader2,
} from 'lucide-react';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { FilterPanel } from '@/components/forms/FilterPanel';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { useReportList, useGenerateReport } from '@/hooks/useReports';
import { usePlants } from '@/hooks/useAssets';
import type { ReportListItem, ReportType } from '@/types/report';

const REPORT_TYPES: Array<{
  value: ReportType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    value: 'inspection',
    label: 'Inspection',
    icon: ClipboardCheck,
    description: 'Inspection pass/fail rates, on-time metrics',
  },
  {
    value: 'defect',
    label: 'Defect',
    icon: AlertTriangle,
    description: 'Severity distribution, resolution status',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    icon: Wrench,
    description: 'Work order flow, completion rates',
  },
  {
    value: 'compliance',
    label: 'Compliance',
    icon: ShieldCheck,
    description: 'Weighted score across all modules',
  },
];

export default function ReportsPage() {
  const navigate = useNavigate();
  const reportListQuery = useReportList();
  const generateMutation = useGenerateReport();
  const plantsQuery = usePlants();

  const [selectedType, setSelectedType] = useState<ReportType | ''>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [plantId, setPlantId] = useState('');

  const plantOptions = useMemo(
    () => [
      { value: '', label: 'All plants' },
      ...(plantsQuery.data?.data ?? []).map((p) => ({ value: p.id, label: p.name })),
    ],
    [plantsQuery.data],
  );

  const handleGenerate = () => {
    if (!selectedType) return;
    generateMutation.mutate(
      {
        type: selectedType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        plantId: plantId || undefined,
      },
      {
        onSuccess: (report) => {
          setSelectedType('');
          setDateFrom('');
          setDateTo('');
          setPlantId('');
          navigate(`/reports/${report.id}`);
        },
      },
    );
  };

  const recentColumns = useMemo<ColumnDef<ReportListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'type',
        header: 'Type',
        cell: (info) => {
          const t = info.getValue() as string;
          const label = REPORT_TYPES.find((rt) => rt.value === t)?.label ?? t;
          return <span className="text-caption capitalize font-medium">{label}</span>;
        },
        size: 130,
      },
      {
        accessorKey: 'dateFrom',
        header: 'From',
        cell: (info) => {
          const v = info.getValue() as string | null;
          return <span className="text-caption text-text-secondary">{v ?? '—'}</span>;
        },
        size: 120,
      },
      {
        accessorKey: 'dateTo',
        header: 'To',
        cell: (info) => {
          const v = info.getValue() as string | null;
          return <span className="text-caption text-text-secondary">{v ?? '—'}</span>;
        },
        size: 120,
      },
      {
        accessorKey: 'plantId',
        header: 'Plant',
        cell: (info) => {
          const v = info.getValue() as string | null;
          if (!v) return <span className="text-caption text-text-secondary">All</span>;
          const plant = plantsQuery.data?.data.find((p) => p.id === v);
          return <span className="text-caption">{plant?.name ?? v.slice(0, 8)}</span>;
        },
        size: 140,
      },
      {
        accessorKey: 'generatedAt',
        header: 'Generated',
        cell: (info) => {
          const d = new Date(info.getValue() as string);
          return <span className="text-caption text-text-secondary">{d.toLocaleString()}</span>;
        },
        size: 180,
      },
    ],
    [plantsQuery.data],
  );

  const recentReports = reportListQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate operational reports across inspections, defects, maintenance, and compliance."
        eyebrow="Analytics"
      />

      {/* Generate new report */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h2 className="mb-4 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Generate New Report
        </h2>

        {/* Type cards */}
        <div className="grid grid-cols-2 gap-3 mb-5 sm:grid-cols-4">
          {REPORT_TYPES.map((rt) => {
            const isSelected = selectedType === rt.value;
            return (
              <button
                key={rt.value}
                type="button"
                onClick={() => setSelectedType(isSelected ? '' : rt.value)}
                className={`flex flex-col items-center gap-2 rounded-sm border-2 p-4 text-left transition-colors ${
                  isSelected
                    ? 'border-interactive-default bg-interactive-subtle'
                    : 'border-border-default hover:border-border-strong hover:bg-bg-surface-raised'
                }`}
              >
                <rt.icon
                  className={`h-5 w-5 ${isSelected ? 'text-interactive-default' : 'text-text-secondary'}`}
                />
                <div className="text-center">
                  <p className={`text-caption font-semibold ${isSelected ? 'text-interactive-default' : 'text-text-primary'}`}>
                    {rt.label}
                  </p>
                  <p className="text-caption-sm text-text-muted">{rt.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Filters */}
        <FilterPanel>
          <div className="w-full sm:w-48">
            <SelectField
              label="Plant"
              showLabel={false}
              name="plantId"
              value={plantId}
              onChange={(e) => setPlantId(e.target.value)}
              options={plantOptions}
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-caption font-medium text-text-secondary mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-10 w-full rounded-sm border border-border-default bg-bg-surface px-3 text-body text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
            />
          </div>
          <div className="w-full sm:w-40">
            <label className="block text-caption font-medium text-text-secondary mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-10 w-full rounded-sm border border-border-default bg-bg-surface px-3 text-body text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
            />
          </div>
          <div className="flex items-end">
            <Button
              size="md"
              onClick={handleGenerate}
              disabled={!selectedType || generateMutation.isPending}
              className="gap-1.5"
            >
              {generateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Generate Report
            </Button>
          </div>
        </FilterPanel>

        {generateMutation.isError && (
          <p className="mt-3 text-caption text-status-critical">
            Generate failed: {(generateMutation.error as Error)?.message ?? 'Unknown error'}
          </p>
        )}
      </section>

      {/* Recent reports */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h2 className="mb-4 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Recent Reports ({recentReports.length})
        </h2>
        <DataTable
          columns={recentColumns}
          data={recentReports}
          isLoading={reportListQuery.isLoading}
          onRowClick={(report) => navigate(`/reports/${report.id}`)}
          emptyState="No reports yet. Generate one above."
          pageSize={10}
        />
      </section>
    </div>
  );
}