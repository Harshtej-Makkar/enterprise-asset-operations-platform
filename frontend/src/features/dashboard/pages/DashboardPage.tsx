import { useDashboardKpis, useRecentActivity } from '@/hooks/useDashboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';
import type { DashboardKpis } from '@/types/dashboard';
import { Boxes, ClipboardCheck, AlertTriangle, KanbanSquare, ShieldAlert, Activity } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: 'default' | 'warning' | 'critical' | 'success';
}

function KpiCard({ label, value, hint, icon: Icon, tone = 'default' }: KpiCardProps) {
  const toneClass =
    tone === 'critical'
      ? 'text-accent-signal'
      : tone === 'warning'
        ? 'text-status-warning'
        : tone === 'success'
          ? 'text-status-success'
          : 'text-text-primary';
  return (
    <div className="rounded-sm border border-border-default bg-bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-caption uppercase tracking-wider text-text-secondary">
          {label}
        </span>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </div>
      <div className={`mt-3 font-mono text-h2 font-bold ${toneClass}`}>{value}</div>
      {hint && <p className="mt-1 text-caption text-text-muted">{hint}</p>}
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="rounded-sm border border-border-default bg-bg-surface p-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

function kpiTone(
  k: keyof DashboardKpis,
  v: number,
): 'default' | 'warning' | 'critical' | 'success' {
  if (k === 'criticalDefectsAwaitingApproval') return v > 0 ? 'critical' : 'default';
  if (k === 'openDefects') return v > 0 ? 'warning' : 'default';
  if (k === 'openWorkOrders') return v > 0 ? 'warning' : 'default';
  return 'default';
}

/**
 * Dashboard page (Week 1 shell).
 * Real KPI data flows in once the backend's /dashboard/kpis endpoint is wired
 * (which it is at scaffold time — the values come straight from the seed).
 */
export default function DashboardPage() {
  const { data: kpis, isLoading } = useDashboardKpis();
  const { data: recent } = useRecentActivity();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-h2 font-bold text-text-primary">Dashboard</h2>
        <p className="mt-1 text-body text-text-secondary">
          Live operational KPIs derived from inspections, defects, and work orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {isLoading || !kpis ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard label="Total Assets" value={kpis.totalAssets} icon={Boxes} />
            <KpiCard
              label="Pending Inspections"
              value={kpis.pendingInspections}
              icon={ClipboardCheck}
            />
            <KpiCard
              label="Open Defects"
              value={kpis.openDefects}
              icon={AlertTriangle}
              tone={kpiTone('openDefects', kpis.openDefects)}
            />
            <KpiCard
              label="Critical Awaiting Approval"
              value={kpis.criticalDefectsAwaitingApproval}
              icon={ShieldAlert}
              tone={kpiTone('criticalDefectsAwaitingApproval', kpis.criticalDefectsAwaitingApproval)}
            />
            <KpiCard
              label="Open Work Orders"
              value={kpis.openWorkOrders}
              icon={KanbanSquare}
              tone={kpiTone('openWorkOrders', kpis.openWorkOrders)}
            />
            <KpiCard
              label="Inspection Completion"
              value={`${kpis.inspectionCompletionRate.toFixed(0)}%`}
              icon={Activity}
              tone="success"
              hint="Past 30 days"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-border-default bg-bg-surface p-4 lg:col-span-2">
          <h3 className="font-mono text-caption uppercase tracking-wider text-text-secondary">
            Recent Activity
          </h3>
          <ul className="mt-3 space-y-2">
            {!recent || recent.length === 0 ? (
              <li className="text-caption text-text-muted">
                No recent activity yet — once inspections and work orders start
                flowing in, they'll appear here in real time.
              </li>
            ) : (
              recent.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b border-border-default pb-2 last:border-b-0 last:pb-0"
                >
                  <div>
                    <p className="text-body text-text-primary">{item.message}</p>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-text-muted">
                      {item.userName} · {item.type}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-caption text-text-muted">
                    {formatDateTime(item.createdAt)}
                  </span>
                </li>
              ))
            )}
          </ul>
        </div>
        <div className="rounded-sm border border-border-default bg-bg-surface p-4">
          <h3 className="font-mono text-caption uppercase tracking-wider text-text-secondary">
            Asset Health
          </h3>
          {kpis ? (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-body text-text-primary">Healthy</span>
                <Badge variant="success">{kpis.assetHealthSummary.healthy}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-text-primary">Needs attention</span>
                <Badge variant="warning">
                  {kpis.assetHealthSummary.needsAttention}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-body text-text-primary">Critical</span>
                <Badge variant="signal">
                  {kpis.assetHealthSummary.critical}
                </Badge>
              </div>
            </div>
          ) : (
            <Skeleton className="mt-3 h-20 w-full" />
          )}
        </div>
      </div>
    </div>
  );
}
