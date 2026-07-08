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
 * Dashboard controller — GET /api/dashboard/kpis, /api/dashboard/recent
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

    const today = new Date('2026-07-07T00:00:00Z').getTime();
    const pendingInspections = insp.filter(
      (i) => i.completed_at === null && new Date(i.scheduled_date).getTime() <= today,
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
   * Returns pre-aggregated time-series data for the dashboard charts.
   * Sparse by design — only inspections from the seed are present at
   * this point, so the bar chart will show 2 inspections in June 2026
   * (the seed) and 0 in every other bucket. The chart renders; the
   * numbers fill in as later weeks produce inspections.
   */
  trends(_req: Request, res: Response): void {
    const all = allInspections();
    // Build the last-30-days bucket list. 30-day window because that's
    // the typical dashboard default.
    const today = new Date('2026-07-07T00:00:00Z');
    const days: { date: string; pass: number; fail: number; pending: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({ date: iso, pass: 0, fail: 0, pending: 0 });
    }
    const byDate = new Map(days.map((d) => [d.date, d]));
    for (const insp of all) {
      if (!insp.completed_at) continue;
      const d = insp.completed_at.slice(0, 10);
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
