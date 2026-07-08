import { type ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, MapPin, Wrench } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { DataTable } from '@/components/tables/DataTable';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { useAsset, useAssetDefects, useAssetInspections } from '@/hooks/useAssets';
import type { Defect } from '@/types/defect';
import type { Inspection } from '@/types/inspection';

/**
 * Asset Detail page (Week 2 build).
 *
 * Desktop-first per TRD §16. Shows:
 *   - the asset's general info (code, name, type, plant, department, status)
 *   - a generated QR code image of the asset code
 *   - inspection history (compact table, no pagination — asset-scoped)
 *   - defect history (compact table, no pagination — asset-scoped)
 */
export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const assetQuery = useAsset(id);
  const inspectionsQuery = useAssetInspections(id);
  const defectsQuery = useAssetDefects(id);

  const inspectionColumns = useMemo<ColumnDef<Inspection, unknown>[]>(
    () => [
      {
        accessorKey: 'scheduledDate',
        header: 'Date',
        cell: (info) => (
          <span className="font-mono text-caption">{info.getValue() as string}</span>
        ),
        size: 120,
      },
      {
        accessorKey: 'inspector',
        header: 'Inspector',
        cell: (info) => {
          const i = info.row.original.inspector;
          return i ? i.fullName : <span className="text-text-muted">—</span>;
        },
      },
      {
        accessorKey: 'overallResult',
        header: 'Result',
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
        size: 120,
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

  const defectColumns = useMemo<ColumnDef<Defect, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Reported',
        cell: (info) => (
          <span className="font-mono text-caption">{info.getValue() as string}</span>
        ),
        size: 120,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: (info) => <span>{info.getValue() as string}</span>,
      },
      {
        accessorKey: 'severity',
        header: 'Severity',
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
        size: 110,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue() as string} />,
        size: 170,
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: (info) => (
          <span className="line-clamp-2 max-w-md text-text-secondary">{info.getValue() as string}</span>
        ),
      },
    ],
    [],
  );

  if (assetQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading asset…" eyebrow="Assets" />
      </div>
    );
  }

  if (assetQuery.isError || !assetQuery.data) {
    return (
      <PagePlaceholder
        title="Asset Not Found"
        description={`No asset with id ${id ?? '—'} could be loaded.`}
        week=""
        bullets={['Check the URL and try again.']}
      />
    );
  }

  const asset = assetQuery.data;
  const inspections = inspectionsQuery.data?.data ?? [];
  const defects = defectsQuery.data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/assets')}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Asset Registry
        </Button>
      </div>

      <PageHeader
        title={asset.name}
        description={asset.assetCode}
        eyebrow="Asset Detail"
        actions={<StatusBadge status={asset.status} />}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info card — 2/3 width on desktop, full width on mobile */}
        <div className="rounded-sm border border-border-default bg-bg-surface p-5 lg:col-span-2">
          <h3 className="mb-4 font-mono text-caption uppercase tracking-wider text-text-secondary">
            General Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <InfoRow label="Asset Code" value={asset.assetCode} mono />
            <InfoRow label="Name" value={asset.name} />
            <InfoRow
              label="Type"
              value={asset.assetType?.name ?? '—'}
            />
            <InfoRow
              label="Plant"
              value={
                asset.plant ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                    {asset.plant.name}
                    <span className="text-text-secondary">·</span>
                    <span className="text-text-secondary">{asset.plant.city}</span>
                  </span>
                ) : (
                  '—'
                )
              }
            />
            <InfoRow label="Department" value={asset.department ?? '—'} />
            <InfoRow
              label="Created"
              value={
                <span className="font-mono text-caption text-text-secondary">
                  {asset.createdAt.slice(0, 10)}
                </span>
              }
            />
          </dl>
          <div className="mt-6 flex gap-6 border-t border-border-default pt-4 text-caption">
            <span className="inline-flex items-center gap-1.5 text-text-secondary">
              <Wrench className="h-3.5 w-3.5" />
              <span className="text-text-primary">{asset.inspectionCount ?? 0}</span> inspections
            </span>
            <span className="inline-flex items-center gap-1.5 text-text-secondary">
              <Wrench className="h-3.5 w-3.5" />
              <span className="text-text-primary">{asset.defectCount ?? 0}</span> defects
            </span>
          </div>
        </div>

        {/* QR code — 1/3 width on desktop, full width on mobile */}
        <div className="rounded-sm border border-border-default bg-bg-surface p-5">
          <h3 className="mb-4 font-mono text-caption uppercase tracking-wider text-text-secondary">
            Asset QR Code
          </h3>
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-sm border border-border-default bg-text-primary p-4">
              <QRCodeSVG
                value={asset.assetCode}
                size={180}
                bgColor="#E8EAED"
                fgColor="#14161A"
                level="M"
              />
            </div>
            <p className="font-mono text-caption text-text-secondary">{asset.assetCode}</p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-h4 font-semibold text-text-primary">Inspection History</h2>
        <DataTable
          columns={inspectionColumns}
          data={inspections}
          isLoading={inspectionsQuery.isLoading}
          noHover
          pageSize={5}
          emptyState="No inspections have been recorded for this asset yet."
        />
      </div>

      <div>
        <h2 className="mb-3 text-h4 font-semibold text-text-primary">Defect History</h2>
        <DataTable
          columns={defectColumns}
          data={defects}
          isLoading={defectsQuery.isLoading}
          noHover
          pageSize={5}
          emptyState="No defects have been logged for this asset."
        />
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-caption text-text-secondary">{label}</dt>
      <dd className={mono ? 'font-mono text-body text-text-primary' : 'text-body text-text-primary'}>
        {value}
      </dd>
    </div>
  );
}
