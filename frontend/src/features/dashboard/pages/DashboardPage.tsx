import {
  Activity,
  AlertTriangle,
  Boxes,
  ClipboardCheck,
  KanbanSquare,
  ShieldAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ChartCard } from '@/components/data-display/ChartCard';
import { StatCard } from '@/components/data-display/StatCard';
import { PageHeader } from '@/components/common/PageHeader';
import { SegmentedToggle } from '@/components/common/SegmentedToggle';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardKpis, useDashboardTrends, useRecentActivity } from '@/hooks/useDashboard';
import { formatDateShort, formatDateTime } from '@/lib/utils';
import type { DefectsBySeverity, InspectionsByDayBucket } from '@/types/dashboard';

type ViewMode = 'day' | 'week' | 'month';

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

interface ChartBucket {
  /** label for the X axis */
  label: string;
  pass: number;
  fail: number;
  pending: number;
  /** start of date range for navigation (YYYY-MM-DD) */
  fromDate: string;
  /** end of date range for navigation (YYYY-MM-DD) */
  toDate: string;
}

/**
 * Dashboard page (Week 2 build).
 *
 * Desktop-first per TRD §16 (Dashboard is one of the management/desk
 * modules). Layout:
 *   - PageHeader with eyebrow + description
 *   - 6 StatCards in a 6-column grid on lg+
 *   - 2 ChartCards side-by-side on lg+: bar chart of inspections with
 *     a Day/Week/Month segmented toggle inside the chart header, and
 *     a pie chart of defects by severity (toggle scoped to bar only)
 *   - Recent activity list and asset health summary
 *
 * The Day/Week/Month toggle derives all three views from the backend's
 * existing 30 daily buckets — no backend changes needed. Weeks run
 * Monday–Sunday (ISO convention). Under "Month" mode the chart
 * subtitle explicitly states the trailing-30-day window so the user
 * knows the data range.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const kpisQuery = useDashboardKpis();
  const trendsQuery = useDashboardTrends();
  const recentQuery = useRecentActivity();

  const [view, setView] = useState<ViewMode>('week');

  // Derive the bar-chart series from the active view + raw daily data.
  const chartBuckets = useMemo<ChartBucket[]>(() => {
    const daily = trendsQuery.data?.inspectionsByDay ?? [];
    if (daily.length === 0) return [];
    if (view === 'day') return daily.slice(-7).map(toDayBucket);
    if (view === 'month') return daily.map(toDayBucket);
    return groupByWeekMon(daily);
  }, [trendsQuery.data, view]);

  const chartSubtitle =
    view === 'day'
      ? 'Last 7 days'
      : view === 'week'
        ? 'Grouped Mon–Sun, last 30 days'
        : 'Last 30 days available';

  const severityChart = useMemo(
    () => toSeverityChart(trendsQuery.data?.defectsBySeverity),
    [trendsQuery.data],
  );

  const anyLoading = kpisQuery.isLoading || trendsQuery.isLoading;

  const handleBarClick = useMemo(
    () => (data: { activePayload?: Array<{ payload: ChartBucket }> }) => {
      const bucket = data?.activePayload?.[0]?.payload;
      if (!bucket) return;
      const statuses: string[] = [];
      if (bucket.pass > 0) statuses.push('pass');
      if (bucket.fail > 0) statuses.push('fail');
      if (bucket.pending > 0) statuses.push('pending');
      const params = new URLSearchParams();
      params.set('from', bucket.fromDate);
      params.set('to', bucket.toDate);
      if (statuses.length > 0 && statuses.length < 3) {
        params.set('status', statuses.join(','));
      }
      navigate(`/inspections?${params.toString()}`);
    },
    [navigate],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Live operational KPIs derived from inspections, defects, and work orders."
        eyebrow="Overview"
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {anyLoading ? (
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
            <StatCard title="Total Assets" value={kpisQuery.data?.totalAssets ?? 0} icon={Boxes} />
            <StatCard
              title="Pending Inspections"
              value={kpisQuery.data?.pendingInspections ?? 0}
              icon={ClipboardCheck}
              tone="warning"
            />
            <StatCard
              title="Open Defects"
              value={kpisQuery.data?.openDefects ?? 0}
              icon={AlertTriangle}
              tone="warning"
            />
            <StatCard
              title="Critical Awaiting Approval"
              value={kpisQuery.data?.criticalDefectsAwaitingApproval ?? 0}
              icon={ShieldAlert}
              tone="signal"
            />
            <StatCard
              title="Open Work Orders"
              value={kpisQuery.data?.openWorkOrders ?? 0}
              icon={KanbanSquare}
              tone="warning"
            />
            <StatCard
              title="Completion"
              value={`${(kpisQuery.data?.inspectionCompletionRate ?? 0).toFixed(0)}%`}
              icon={Activity}
              tone="success"
              footer="Past 30 days"
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <ChartCard
          title="Inspections"
          description={chartSubtitle}
          className="lg:col-span-2"
          actions={
            <SegmentedToggle
              ariaLabel="Inspections view"
              options={VIEW_OPTIONS}
              value={view}
              onChange={setView}
            />
          }
          isEmpty={!trendsQuery.isLoading && !chartBuckets.some((b) => b.pass + b.fail + b.pending > 0)}
          emptyMessage="No inspections have been completed in the last 30 days yet — they'll appear here as inspectors work through the queue."
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartBuckets} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} onClick={handleBarClick} style={{ cursor: 'pointer' }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="rgba(255,255,255,0.45)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.45)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={32}
              />
              <Tooltip
                contentStyle={{
                  background: '#1E2126',
                  border: '1px solid #33383F',
                  borderRadius: 4,
                  fontSize: 12,
                }}
                cursor={{ fill: 'rgba(91,141,239,0.06)' }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              />
              <Bar dataKey="pass" name="Pass" stackId="a" fill="#3FB37F" radius={[0, 0, 0, 0]} />
              <Bar dataKey="fail" name="Fail" stackId="a" fill="#E5484D" radius={[0, 0, 0, 0]} />
              <Bar dataKey="pending" name="Pending" stackId="a" fill="#D9A93E" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          {chartBuckets.length > 0 && (
            <p className="mt-2 font-mono text-[11px] text-text-muted">
              Click a bar to view filtered inspections &rarr;
            </p>
          )}
        </ChartCard>

        <ChartCard
          title="Defects by severity"
          description="Snapshot across all plants"
          isEmpty={!trendsQuery.isLoading && severityChart.every((d) => d.value === 0)}
        >
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Tooltip
                contentStyle={{
                  background: '#1E2126',
                  border: '1px solid #33383F',
                  borderRadius: 4,
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, paddingTop: 4 }}
              />
              <Pie
                data={severityChart}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={80}
                paddingAngle={2}
                stroke="#14161A"
              >
                {severityChart.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Recent activity + asset health */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-sm border border-border-default bg-bg-surface p-4 lg:col-span-2">
          <h3 className="font-mono text-caption uppercase tracking-wider text-text-secondary">
            Recent Activity
          </h3>
          <ul className="mt-3 space-y-2">
            {recentQuery.isLoading ? (
              <li>
                <Skeleton className="h-12 w-full" />
              </li>
            ) : !recentQuery.data || recentQuery.data.length === 0 ? (
              <li className="text-caption text-text-muted">
                No recent activity yet — once inspections and work orders start flowing in, they'll
                appear here in real time.
              </li>
            ) : (
              recentQuery.data.map((item) => (
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
          {kpisQuery.isLoading || !kpisQuery.data ? (
            <Skeleton className="mt-3 h-20 w-full" />
          ) : (
            <div className="mt-3 space-y-2">
              <HealthRow label="Healthy" value={kpisQuery.data.assetHealthSummary.healthy} variant="success" />
              <HealthRow
                label="Needs attention"
                value={kpisQuery.data.assetHealthSummary.needsAttention}
                variant="warning"
              />
              <HealthRow
                label="Critical"
                value={kpisQuery.data.assetHealthSummary.critical}
                variant="signal"
              />
            </div>
          )}
        </div>
      </div>
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

function HealthRow({
  label,
  value,
  variant,
}: {
  label: string;
  value: number;
  variant: 'success' | 'warning' | 'signal';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-body text-text-primary">{label}</span>
      <span
        className={
          variant === 'success'
            ? 'inline-flex h-6 min-w-[2rem] items-center justify-center rounded-pill bg-[rgba(63,179,127,0.12)] px-2 font-mono text-caption text-status-success'
            : variant === 'warning'
              ? 'inline-flex h-6 min-w-[2rem] items-center justify-center rounded-pill bg-[rgba(217,169,62,0.12)] px-2 font-mono text-caption text-status-warning'
              : 'inline-flex h-6 min-w-[2rem] items-center justify-center rounded-pill bg-[rgba(245,166,35,0.14)] px-2 font-mono text-caption text-accent-signal'
        }
      >
        {value}
      </span>
    </div>
  );
}

// --- chart aggregation helpers -------------------------------------------

/** Map a single daily bucket to its chart representation. */
function toDayBucket(d: InspectionsByDayBucket): ChartBucket {
  return { label: formatDateShort(d.date), fromDate: d.date, toDate: d.date, pass: d.pass, fail: d.fail, pending: d.pending };
}

/**
 * Group daily buckets into Monday-anchored weeks and sum pass/fail/
 * pending per week. The label is the Monday's date in dd/mm form.
 *
 * Walks the daily list, and for each day, finds the Monday of that
 * week (using ISO: Monday=1..Sunday=7). New weeks start a new bucket.
 * Days outside the dataset range (e.g. a partial leading week) are
 * included if present in the array.
 */
function groupByWeekMon(daily: InspectionsByDayBucket[]): ChartBucket[] {
  if (daily.length === 0) return [];
  const out: ChartBucket[] = [];
  let current: ChartBucket | null = null;
  let currentMonday: string | null = null;

  for (const d of daily) {
    const monday = mondayOf(d.date);
    if (monday !== currentMonday) {
      if (current) out.push(current);
      currentMonday = monday;
      current = { label: formatDateShort(monday), fromDate: monday, toDate: sundayOf(monday), pass: 0, fail: 0, pending: 0 };
    }
    current!.pass += d.pass;
    current!.fail += d.fail;
    current!.pending += d.pending;
  }
  if (current) out.push(current);
  return out;
}

/**
 * Return the ISO (Monday-anchored) week-start date for a YYYY-MM-DD
 * date string. Uses UTC math so the result doesn't depend on the
 * client's local timezone.
 */
function mondayOf(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  // Use UTC to avoid timezone drift
  const dt = new Date(Date.UTC(y, m - 1, d));
  // JS getUTCDay: Sun=0..Sat=6. We want Mon=0..Sun=6
  const dow = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - dow);
  return dt.toISOString().slice(0, 10);
}

/**
 * Return Sunday's date for the given Monday. monday: "2026-06-22" → "2026-06-28".
 */
function sundayOf(monday: string): string {
  const [y, m, d] = monday.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + 6);
  return dt.toISOString().slice(0, 10);
}

function toSeverityChart(severity: DefectsBySeverity | undefined) {
  // Order by descending severity so the chart's colour ramp is
  // intuitive. Pulls from the design-token palette.
  return [
    { name: 'Critical', value: severity?.critical ?? 0, color: '#F5A623' },
    { name: 'High', value: severity?.high ?? 0, color: '#E5484D' },
    { name: 'Medium', value: severity?.medium ?? 0, color: '#D9A93E' },
    { name: 'Low', value: severity?.low ?? 0, color: '#5B6472' },
  ];
}
