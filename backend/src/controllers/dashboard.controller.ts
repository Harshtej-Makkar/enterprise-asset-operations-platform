import type { Request, Response } from 'express';
import {
  allDefects,
  allInspections,
  allWorkOrders,
  seedAssets,
  seedAuditLogs,
  seedUsers,
} from '../repositories/memory-store.js';

/**
 * Dashboard controller — GET /api/dashboard/kpis, /api/dashboard/trends
 *
 * Returns aggregates derived from the seed data so the dashboard visibly
 * "fills in" with real numbers on Day 1, then continues to grow as users
 * create inspections/defects/work orders in later weeks.
 */
export const dashboardController = {
  kpis(_req: Request, res: Response): void {
    const totalAssets = seedAssets.length;

    const insp = allInspections();
    const def = allDefects();
    const wo = allWorkOrders();

    // Pending inspections = any inspection whose overall_result is
    // 'pending' (i.e. it has not been completed yet). This matches the
    // Inspection List's `status=pending` filter exactly, so the
    // number printed on the dashboard card equals the number shown on
    // the list page when the user clicks in. Note: this is different
    // from "overdue" — a pending inspection scheduled for a future
    // date still counts here. If we later want an "overdue" KPI, it
    // should be a separate field so the count semantics stay clear.
    const pendingInspections = insp.filter(
      (i) => i.overall_result === 'pending',
    ).length;

    const openDefects = def.filter(
      (d) => d.status === 'open' || d.status === 'pending_approval',
    ).length;

    const criticalDefectsAwaitingApproval = def.filter(
      (d) => d.severity === 'critical' && d.status === 'pending_approval',
    ).length;

    const openWorkOrders = wo.filter(
      (w) => w.status === 'open' || w.status === 'assigned' || w.status === 'in_progress',
    ).length;

    const total = insp.length || 1;
    const completed = insp.filter((i) => i.completed_at !== null).length;
    const inspectionCompletionRate = Math.round((completed / total) * 100);

    const underMaintenance = seedAssets.filter((a) => a.status === 'under_maintenance').length;
    const needsAttention = def.filter(
      (d) => d.status === 'open' || d.status === 'pending_approval',
    ).length;
    const critical = criticalDefectsAwaitingApproval;

    res.json({
      totalAssets,
      pendingInspections,
      openDefects,
      criticalDefectsAwaitingApproval,
      openWorkOrders,
      inspectionCompletionRate,
      assetHealthSummary: {
        healthy: totalAssets - underMaintenance - needsAttention,
        needsAttention,
        critical,
      },
    });
  },

  /**
   * GET /api/dashboard/trends
   *
   * Returns pre-aggregated time-series data for the dashboard charts.
   *
   * Day-bucket assignment rule — all inspections are bucketed by
   * `scheduled_date` regardless of completion status. This ensures the
   * chart always agrees with the Inspection List, which filters by
   * `scheduled_date`. Clicking a bar on the chart navigates to
   * /inspections?from=date&to=date, and the totals are guaranteed to
   * match because both the chart and the list operate on the same
   * `scheduled_date` field.
   *
   * Window: stretches from the earliest `scheduled_date` in the data
   * (or 30 days back from today, whichever covers more) up to TODAY.
   * The chart's right edge is capped at `today` (not the latest
   * scheduled_date) so its visible window matches the Inspection
   * List's default 30-day window exactly — that way the totals
   * printed on the chart always equal the total printed on the list
   * for the same range. Clicking a future-scheduled bar still
   * navigates to that day correctly; we just don't render bars
   * past today on the chart axis itself.
   */
  trends(_req: Request, res: Response): void {
    const all = allInspections();

    // Find the relevant start date from the data so the window
    // adjusts to whatever inspections actually exist. Only scheduled_date
    // matters — the chart and inspection list both key off it.
    const scheduledDates = all
      .map((i) => i.scheduled_date)
      .filter((d): d is string => typeof d === 'string' && d.length > 0);

    // Real "today" — chart's right edge always lands on today so the
    // window matches the Inspection List's default range.
    const realToday = new Date().toISOString().slice(0, 10);

    const earliestScheduled = scheduledDates.length
      ? scheduledDates.reduce((a, b) => (a < b ? a : b))
      : realToday;

    // End-of-window is always today — aligns with the Inspection
    // List's default `to` filter so the two totals agree.
    const end = parseIsoDate(realToday);

    // Start = the earlier of (earliestScheduled, 30 days before end)
    // so the window is at least 30 days but also covers any earlier
    // scheduled dates.
    const start = minDate(
      parseIsoDate(earliestScheduled),
      addDays(end, -30),
    );

    // Build the daily buckets for [start, end] inclusive.
    const days: { date: string; pass: number; fail: number; pending: number }[] = [];
    for (
      let cursor = start;
      compareDates(cursor, end) <= 0;
      cursor = addDays(cursor, 1)
    ) {
      days.push({ date: toIsoDate(cursor), pass: 0, fail: 0, pending: 0 });
    }
    const byDate = new Map(days.map((d) => [d.date, d]));

    // Bucket every inspection by its scheduled_date. Completed
    // inspections contribute to their result bucket (pass/fail);
    // not-yet-completed inspections contribute as pending.
    for (const insp of all) {
      const d = insp.scheduled_date;
      const bucket = byDate.get(d);
      if (!bucket) continue;
      if (insp.overall_result === 'pass') bucket.pass += 1;
      else if (insp.overall_result === 'fail') bucket.fail += 1;
      else bucket.pending += 1;
    }

    // Defects by severity (snapshot, not time series)
    const allDef = allDefects();
    const defectsBySeverity = {
      low: allDef.filter((d) => d.severity === 'low').length,
      medium: allDef.filter((d) => d.severity === 'medium').length,
      high: allDef.filter((d) => d.severity === 'high').length,
      critical: allDef.filter((d) => d.severity === 'critical').length,
    };

    res.json({
      inspectionsByDay: days,
      defectsBySeverity,
    });
  },

  recent(_req: Request, res: Response): void {
    const items = [...seedAuditLogs]
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .slice(0, 10)
      .map((log) => {
        const user = seedUsers.find((u) => u.id === log.user_id);
        return {
          id: log.id,
          type: log.entity_type,
          message: `${log.action.replace(/_/g, ' ')} on ${log.entity_type}`,
          userName: user?.full_name ?? 'System',
          createdAt: log.created_at,
        };
      });
    res.json(items);
  },
};

// --- date helpers (UTC, no external deps) --------------------------------

/** Parse a YYYY-MM-DD string to a Date at 00:00:00Z. */
function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

/** Format a Date back to YYYY-MM-DD using UTC. */
function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Add (or subtract) N days from a Date, returning a new Date. */
function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setUTCDate(r.getUTCDate() + n);
  return r;
}

/** Compare two Dates (a - b). Negative if a < b, 0 if equal, positive otherwise. */
function compareDates(a: Date, b: Date): number {
  const aIso = toIsoDate(a);
  const bIso = toIsoDate(b);
  if (aIso < bIso) return -1;
  if (aIso > bIso) return 1;
  return 0;
}

/** Return whichever Date represents the earlier calendar day. */
function minDate(a: Date, b: Date): Date {
  return compareDates(a, b) <= 0 ? a : b;
}
