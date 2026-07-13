import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/tables/DataTable';
import { useReport } from '@/hooks/useReports';
import { reportService } from '@/services/api/report.service';
import type { IndicatorResult } from '@/types/report';

function IndicatorRow({ ind }: { ind: IndicatorResult }) {
  const percent = ind.score !== null ? `${Math.round(ind.score)}%` : 'N/A';
  const barColor =
    ind.score !== null
      ? ind.score >= 80
        ? 'bg-green-500'
        : ind.score >= 50
          ? 'bg-amber-500'
          : 'bg-red-500'
      : 'bg-neutral-200';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-caption">
        <span className="font-medium text-text-primary">{ind.label}</span>
        <span className="text-text-secondary">
          {ind.numerator}/{ind.denominator} = {percent}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-bg-surface-raised">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(ind.score ?? 0, 100)}%` }}
        />
      </div>
      {ind.note && <p className="text-caption-sm text-text-muted">{ind.note}</p>}
    </div>
  );
}

export default function ReportViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const reportQuery = useReport(id);

  const handleExportCsv = useCallback(async () => {
    if (!id) return;
    try {
      const blob = await reportService.exportCsv(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${id.slice(0, 8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // Export errors are handled silently — user can retry
    }
  }, [id]);

  if (reportQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (reportQuery.isError || !reportQuery.data) {
    return (
      <div className="space-y-6 py-12 text-center">
        <p className="text-body text-text-secondary">Report not found.</p>
        <Button variant="outline" size="sm" onClick={() => navigate('/reports')}>
          Back to Reports
        </Button>
      </div>
    );
  }

  const report = reportQuery.data;
  const { data: reportData } = report;

  // Build dynamic columns from the first row's keys
  const columns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(() => {
    if (reportData.rows.length === 0) return [];
    const keys = Object.keys(reportData.rows[0]);
    return keys.map((key) => ({
      accessorKey: key,
      header: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      cell: (info) => {
        const v = info.getValue();
        if (v == null) return <span className="text-caption text-text-muted">—</span>;
        return <span className="text-caption">{String(v)}</span>;
      },
      size: 150,
    }));
  }, [reportData.rows]);

  const summaryEntries = Object.entries(reportData.summary ?? {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/reports')}
          className="gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </Button>
        {reportData.rows.length > 0 && (
          <Button size="sm" variant="outline" onClick={handleExportCsv} className="gap-1.5">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        )}
      </div>

      <PageHeader
        title={`${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report`}
        description={`Generated ${new Date(report.generatedAt).toLocaleString()}`}
        eyebrow="Report Viewer"
      />

      {/* Summary KPI cards */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h2 className="mb-3 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Summary
        </h2>
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryEntries.map(([key, value]) => {
            // Skip nested objects (like bySeverity, byStatus) in the flat grid
            if (typeof value === 'object' && value !== null) return null;
            return (
              <div key={key}>
                <dt className="text-caption text-text-secondary">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </dt>
                <dd className="text-h2 font-bold text-text-primary">
                  {typeof value === 'number' ? value.toLocaleString() : String(value ?? '—')}
                </dd>
              </div>
            );
          })}
        </dl>

        {/* Nested summary keys (bySeverity, byStatus, etc.) */}
        {summaryEntries
          .filter(([, v]) => typeof v === 'object' && v !== null)
          .map(([key, value]) => {
            const nested = value as Record<string, unknown>;
            return (
              <div key={key} className="mt-4 border-t border-border-default pt-4">
                <h3 className="mb-2 text-caption font-medium text-text-secondary">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                </h3>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {Object.entries(nested).map(([subKey, subVal]) => (
                    <div key={subKey} className="rounded-sm bg-bg-surface-raised px-3 py-2 text-center">
                      <div className="text-caption-sm text-text-muted">
                        {subKey.replace(/_/g, ' ')}
                      </div>
                      <div className="text-body font-semibold text-text-primary">
                        {typeof subVal === 'number' ? subVal.toLocaleString() : String(subVal ?? '—')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

        {/* Compliance score */}
        {reportData.complianceScore != null && (
          <div className="mt-4 border-t border-border-default pt-4">
            <div className="flex items-end gap-3">
              <div>
                <h3 className="text-caption font-medium text-text-secondary">
                  Overall Compliance Score
                </h3>
                <p className="text-h1 font-bold text-text-primary">
                  {reportData.complianceScore}%
                </p>
              </div>
              <div
                className={`mb-1 rounded-sm px-2 py-0.5 text-caption font-medium ${
                  reportData.complianceScore >= 80
                    ? 'bg-green-100 text-green-800'
                    : reportData.complianceScore >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {reportData.complianceScore >= 80
                  ? 'Good'
                  : reportData.complianceScore >= 50
                    ? 'Needs Improvement'
                    : 'Critical'}
              </div>
            </div>

            {/* Compliance breakdown */}
            {reportData.complianceBreakdown && (
              <div className="mt-4 space-y-3">
                <IndicatorRow ind={reportData.complianceBreakdown.inspectionTimeliness} />
                <IndicatorRow ind={reportData.complianceBreakdown.criticalDefectResolution} />
                <IndicatorRow ind={reportData.complianceBreakdown.workOrderFlowHealth} />
                {reportData.complianceBreakdown.message && (
                  <p className="mt-2 text-caption-sm italic text-text-muted">
                    {reportData.complianceBreakdown.message}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Data table */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h2 className="mb-3 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Data ({reportData.rows.length} {reportData.rows.length === 1 ? 'record' : 'records'})
        </h2>
        {columns.length > 0 ? (
          <DataTable
            columns={columns}
            data={reportData.rows as Record<string, unknown>[]}
            emptyState="No records in this report."
            pageSize={25}
          />
        ) : (
          <p className="text-caption text-text-secondary">No data columns to display.</p>
        )}
      </section>
    </div>
  );
}