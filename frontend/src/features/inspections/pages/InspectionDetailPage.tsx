import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Image as ImageIcon, MapPin, User } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useInspection, useInspectionItems } from '@/hooks/useInspections';
import type { InspectionItemResponse } from '@/services/api/inspection.service';

/**
 * Inspection Detail page (Week 2 build).
 *
 * Read-only view of a single inspection. Shows the parent record
 * (asset, inspector, dates, overall result) plus the per-item checklist
 * breakdown (item label, result, notes, photo if present).
 *
 * Tablet-first per TRD §16. Photos are rendered at a small thumbnail
 * size — clicking opens the full image in a new tab.
 */
export default function InspectionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inspectionQuery = useInspection(id);
  const itemsQuery = useInspectionItems(id);

  const itemColumns = useMemo<ColumnDef<InspectionItemResponse, unknown>[]>(
    () => [
      {
        id: 'order',
        header: '#',
        cell: (info) => (
          <span className="font-mono text-caption text-text-secondary">
            {String(info.row.index + 1).padStart(2, '0')}
          </span>
        ),
        size: 50,
      },
      {
        accessorKey: 'label',
        header: 'Item',
        cell: (info) => <span className="text-body">{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'result',
        header: 'Result',
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
        size: 110,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: (info) => {
          const v = info.getValue() as string | null;
          return v ? (
            <span className="text-caption text-text-secondary">{v}</span>
          ) : (
            <span className="text-text-muted">—</span>
          );
        },
      },
      {
        accessorKey: 'photoUrl',
        header: 'Photo',
        cell: (info) => {
          const v = info.getValue() as string | null;
          if (!v) {
            return info.row.original.requiresPhoto ? (
              <span className="inline-flex items-center gap-1 text-caption text-accent-signal">
                <ImageIcon className="h-3.5 w-3.5" /> missing
              </span>
            ) : (
              <span className="text-text-muted">—</span>
            );
          }
          return (
            <a
              href={v}
              target="_blank"
              rel="noreferrer"
              className="inline-block overflow-hidden rounded-sm border border-border-default"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={v} alt="Checklist item" className="h-10 w-14 object-cover" />
            </a>
          );
        },
        size: 90,
      },
    ],
    [],
  );

  if (inspectionQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading inspection…" eyebrow="Inspections" />
      </div>
    );
  }

  if (inspectionQuery.isError || !inspectionQuery.data) {
    return (
      <PagePlaceholder
        title="Inspection Not Found"
        description={`No inspection with id ${id ?? '—'} could be loaded.`}
        week=""
        bullets={['Check the URL and try again.']}
      />
    );
  }

  const inspection = inspectionQuery.data;
  const items = itemsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/inspections')}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Inspections
      </Button>

      <PageHeader
        title={`Inspection · ${inspection.scheduledDate}`}
        description={inspection.id}
        eyebrow="Inspection Detail"
        actions={<StatusBadge status={inspection.overallResult} />}
      />

      <div className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h3 className="mb-4 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Summary
        </h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-caption text-text-secondary">Asset</dt>
            <dd className="text-body text-text-primary">
              {inspection.asset ? (
                <Link
                  to={`/assets/${inspection.asset.id}`}
                  className="text-status-info hover:underline"
                >
                  <span className="font-mono">{inspection.asset.assetCode}</span> ·{' '}
                  {inspection.asset.name}
                </Link>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Inspector</dt>
            <dd className="text-body text-text-primary">
              {inspection.inspector ? (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-text-secondary" />
                  {inspection.inspector.fullName}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Scheduled Date</dt>
            <dd className="font-mono text-body text-text-primary">{inspection.scheduledDate}</dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Completed At</dt>
            <dd className="font-mono text-body text-text-primary">
              {inspection.completedAt ?? <span className="text-text-muted">—</span>}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Overall Result</dt>
            <dd>
              <StatusBadge status={inspection.overallResult} />
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Plant</dt>
            <dd className="text-body text-text-primary">
              {inspection.asset?.plant ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                  {inspection.asset.plant.name}
                  <span className="text-text-secondary">·</span>
                  <span className="text-text-secondary">{inspection.asset.plant.city}</span>
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h2 className="mb-3 text-h4 font-semibold text-text-primary">Checklist Results</h2>
        <DataTable
          columns={itemColumns}
          data={items}
          isLoading={itemsQuery.isLoading}
          noHover
          pageSize={50}
          emptyState="No checklist items recorded for this inspection."
        />
      </div>
    </div>
  );
}
