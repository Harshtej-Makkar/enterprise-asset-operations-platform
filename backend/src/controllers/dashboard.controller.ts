import type { Request, Response } from 'express';
import {
  seedAssets,
  seedDefects,
  seedInspections,
  seedWorkOrders,
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

    const today = new Date('2026-07-07T00:00:00Z').getTime();
    const pendingInspections = seedInspections.filter(
      (i) => i.completed_at === null && new Date(i.scheduled_date).getTime() <= today,
    ).length;

    const openDefects = seedDefects.filter(
      (d) => d.status === 'open' || d.status === 'pending_approval',
    ).length;

    const criticalDefectsAwaitingApproval = seedDefects.filter(
      (d) => d.severity === 'critical' && d.status === 'pending_approval',
    ).length;

    const openWorkOrders = seedWorkOrders.filter(
      (w) => w.status === 'open' || w.status === 'assigned' || w.status === 'in_progress',
    ).length;

    const total = seedInspections.length || 1;
    const completed = seedInspections.filter((i) => i.completed_at !== null).length;
    const inspectionCompletionRate = Math.round((completed / total) * 100);

    const underMaintenance = seedAssets.filter((a) => a.status === 'under_maintenance').length;
    const needsAttention = seedDefects.filter(
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
