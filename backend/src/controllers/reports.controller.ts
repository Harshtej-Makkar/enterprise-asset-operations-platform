import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  allDefects,
  allInspections,
  allWorkOrders,
  runtimeAuditLogs,
  runtimeReports,
  seedAssets,
  seedPlants,
} from '../repositories/memory-store.js';
import type { AuthedRequest } from '../middleware/auth.js';
import type {
  Defect,
  Inspection,
  WorkOrder,
} from '../types/domain.js';

/**
 * Reports controller — Week 5 implementation.
 *
 * Endpoints:
 *   GET    /api/reports                   → list previously generated reports
 *   POST   /api/reports/generate           → generate a new report
 *   GET    /api/reports/:id                → preview a generated report
 *   GET    /api/reports/:id/export?format=csv → CSV download
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GeneratedReport {
  id: string;
  type: ReportType;
  dateFrom: string | null;
  dateTo: string | null;
  plantId: string | null;
  generatedAt: string;
  generatedBy: string;
  data: ReportData;
}

export type ReportType = 'inspection' | 'defect' | 'maintenance' | 'compliance';

export interface ReportData {
  summary: Record<string, unknown>;
  rows: Record<string, unknown>[];
  /** Only present for compliance reports */
  complianceScore?: number | null;
  complianceBreakdown?: ComplianceBreakdown;
}

export interface ComplianceBreakdown {
  inspectionTimeliness: IndicatorResult;
  criticalDefectResolution: IndicatorResult;
  workOrderFlowHealth: IndicatorResult;
  message?: string;
}

export interface IndicatorResult {
  label: string;
  numerator: number;
  denominator: number;
  score: number | null;
  note?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function assetPlantId(assetId: string): string | undefined {
  return seedAssets.find((a) => a.id === assetId)?.plant_id;
}

/** Shared date-range predicate for inspections, defects, work orders. */
function inDateRange(
  entity: { created_at?: string; scheduled_date?: string },
  from: string | null,
  to: string | null,
): boolean {
  const date = entity.scheduled_date ?? entity.created_at?.slice(0, 10);
  if (!date) return true; // no date info → include (default-safe)
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function filterByPlant<T extends { asset_id: string }>(
  items: T[],
  plantId: string | null,
): T[] {
  if (!plantId) return items;
  return items.filter((i) => assetPlantId(i.asset_id) === plantId);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown): string => {
    const s = v == null ? '' : String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const headerLine = headers.join(',');
  const dataLines = rows.map((r) => headers.map((h) => escape(r[h])).join(','));
  return [headerLine, ...dataLines].join('\n');
}

/* ------------------------------------------------------------------ */
/*  Aggregation logic per report type                                  */
/* ------------------------------------------------------------------ */

function buildInspectionReport(
  inspections: Inspection[],
): ReportData {
  const rows = inspections.map((i) => {
    const asset = seedAssets.find((a) => a.id === i.asset_id);
    return {
      inspectionId: i.id,
      assetCode: asset?.asset_code ?? '',
      assetName: asset?.name ?? '',
      department: asset?.department ?? '',
      plant: seedPlants.find((p) => p.id === asset?.plant_id)?.name ?? '',
      scheduledDate: i.scheduled_date,
      completedAt: i.completed_at ? i.completed_at.slice(0, 10) : '',
      result: i.overall_result,
    };
  });

  const total = rows.length;
  const passed = rows.filter((r) => r.result === 'pass').length;
  const failed = rows.filter((r) => r.result === 'fail').length;
  const pending = rows.filter((r) => r.result === 'pending').length;
  const completedOnTime = rows.filter(
    (r) => r.completedAt && r.completedAt <= r.scheduledDate,
  ).length;

  return {
    summary: {
      totalInspections: total,
      passed,
      failed,
      pending,
      completionRate: total > 0 ? Math.round((passed + failed) / total * 100) : 0,
      completedOnTime,
      onTimeRate: total > 0 ? Math.round(completedOnTime / total * 100) : 0,
    },
    rows,
  };
}

function buildDefectReport(defects: Defect[]): ReportData {
  const rows = defects.map((d) => {
    const asset = seedAssets.find((a) => a.id === d.asset_id);
    return {
      defectId: d.id,
      assetCode: asset?.asset_code ?? '',
      assetName: asset?.name ?? '',
      plant: seedPlants.find((p) => p.id === asset?.plant_id)?.name ?? '',
      severity: d.severity,
      category: d.category,
      description: d.description,
      status: d.status,
      createdAt: d.created_at.slice(0, 10),
    };
  });

  const total = rows.length;
  const openCount = rows.filter((r) => r.status === 'open' || r.status === 'pending_approval').length;
  const resolvedCount = rows.filter((r) => r.status === 'resolved' || r.status === 'work_order_created').length;

  return {
    summary: {
      totalDefects: total,
      bySeverity: {
        low: rows.filter((r) => r.severity === 'low').length,
        medium: rows.filter((r) => r.severity === 'medium').length,
        high: rows.filter((r) => r.severity === 'high').length,
        critical: rows.filter((r) => r.severity === 'critical').length,
      },
      byStatus: {
        open: openCount,
        resolved: resolvedCount,
        rejected: rows.filter((r) => r.status === 'rejected').length,
      },
    },
    rows,
  };
}

function buildMaintenanceReport(workOrders: WorkOrder[]): ReportData {
  const rows = workOrders.map((wo) => {
    const defect = allDefects().find((d) => d.id === wo.defect_id);
    const asset = defect ? seedAssets.find((a) => a.id === defect.asset_id) : undefined;
    return {
      workOrderId: wo.id,
      defectId: wo.defect_id,
      assetCode: asset?.asset_code ?? '',
      assetName: asset?.name ?? '',
      plant: asset ? seedPlants.find((p) => p.id === asset.plant_id)?.name ?? '' : '',
      priority: wo.priority,
      status: wo.status,
      assignedTo: wo.assigned_to ?? '',
      deadline: wo.deadline ?? '',
      createdAt: wo.created_at.slice(0, 10),
    };
  });

  const total = rows.length;
  const completed = rows.filter((r) => r.status === 'completed').length;
  const avgCompletionDays =
    completed > 0
      ? workOrders
          .filter((wo) => wo.status === 'completed')
          .reduce((sum, wo) => {
            const days =
              (new Date(wo.created_at).getTime() - new Date(wo.created_at).getTime()) /
              86400000;
            return sum + (days >= 0 ? days : 0);
          }, 0) / completed
      : 0;

  return {
    summary: {
      totalWorkOrders: total,
      byStatus: {
        open: rows.filter((r) => r.status === 'open').length,
        assigned: rows.filter((r) => r.status === 'assigned').length,
        inProgress: rows.filter((r) => r.status === 'in_progress').length,
        completed,
      },
      avgCompletionDays: Math.round(avgCompletionDays * 10) / 10,
    },
    rows,
  };
}

function buildComplianceReport(
  inspections: Inspection[],
  defects: Defect[],
  workOrders: WorkOrder[],
): ReportData {
  /* --- Indicator 1: Inspection Timeliness (weight 40%) --- */
  const totalInsp = inspections.length;
  const completedOnTime = inspections.filter(
    (i) => i.completed_at && i.completed_at.slice(0, 10) <= i.scheduled_date,
  ).length;
  const score1 = totalInsp > 0 ? (completedOnTime / totalInsp) * 100 : null;

  const indicator1: IndicatorResult = {
    label: 'Inspection Timeliness',
    numerator: completedOnTime,
    denominator: totalInsp,
    score: score1,
    note: totalInsp === 0 ? 'No data in this period' : undefined,
  };

  /* --- Indicator 2: Critical Defect Resolution Rate (weight 35%) --- */
  const criticalDefects = defects.filter((d) => d.severity === 'critical');
  const totalCritical = criticalDefects.length;
  const resolvedCritical = criticalDefects.filter(
    (d) => d.status === 'resolved' || d.status === 'work_order_created',
  ).length;
  const score2 = totalCritical > 0 ? (resolvedCritical / totalCritical) * 100 : null;

  const indicator2: IndicatorResult = {
    label: 'Critical Defect Resolution',
    numerator: resolvedCritical,
    denominator: totalCritical,
    score: score2,
    note: totalCritical === 0 ? 'No data in this period' : undefined,
  };

  /* --- Indicator 3: Work Order Flow Health (weight 25%) --- */
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const stuckOpen = workOrders.filter(
    (wo) =>
      wo.status === 'open' &&
      new Date(wo.created_at) < sevenDaysAgo,
  );
  const totalWO = workOrders.length;
  const score3 = totalWO > 0 ? ((totalWO - stuckOpen.length) / totalWO) * 100 : null;

  const indicator3: IndicatorResult = {
    label: 'Work Order Flow Health',
    numerator: totalWO - stuckOpen.length,
    denominator: totalWO,
    score: score3,
    note: totalWO === 0 ? 'No data in this period' : undefined,
  };

  /* --- Weighted compliance score --- */
  let complianceScore: number | null = null;
  let message: string | undefined;

  const indicators = [indicator1, indicator2, indicator3];
  const weights = [0.40, 0.35, 0.25];
  const activeIndicators = indicators
    .map((ind, i) => ({ ind, weight: weights[i] }))
    .filter(({ ind }) => ind.score !== null);

  if (activeIndicators.length === 0) {
    complianceScore = null;
    message = 'Insufficient data for this period';
  } else {
    // Redistribute weights proportionally across indicators that have data
    const totalActiveWeight = activeIndicators.reduce((s, { weight }) => s + weight, 0);
    complianceScore = Math.round(
      activeIndicators.reduce(
        (sum, { ind, weight }) => sum + ind.score! * (weight / totalActiveWeight),
        0,
      ),
    );
  }

  /* --- Additional audit-readiness flags --- */
  const overdueInspections = inspections.filter(
    (i) => i.overall_result === 'pending' && i.scheduled_date < new Date().toISOString().slice(0, 10),
  ).length;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const unresolvedDefectsOver30Days = defects.filter(
    (d) =>
      d.status !== 'resolved' &&
      d.status !== 'rejected' &&
      d.status !== 'work_order_created' &&
      new Date(d.created_at) < thirtyDaysAgo,
  ).length;

  return {
    summary: {
      totalInspections: totalInsp,
      totalDefects: defects.length,
      totalWorkOrders: totalWO,
      overdueInspections,
      unresolvedDefectsOver30Days,
    },
    rows: [
      ...inspections.map((i) => {
        const asset = seedAssets.find((a) => a.id === i.asset_id);
        return {
          entityType: 'inspection',
          entityId: i.id,
          assetCode: asset?.asset_code ?? '',
          scheduledDate: i.scheduled_date,
          completedAt: i.completed_at?.slice(0, 10) ?? '',
          status: i.overall_result,
          onTime: i.completed_at && i.completed_at.slice(0, 10) <= i.scheduled_date ? 'Yes' : 'No',
        };
      }),
      ...criticalDefects.map((d) => {
        const asset = seedAssets.find((a) => a.id === d.asset_id);
        return {
          entityType: 'defect',
          entityId: d.id,
          assetCode: asset?.asset_code ?? '',
          severity: d.severity,
          status: d.status,
          createdAt: d.created_at.slice(0, 10),
        };
      }),
      ...workOrders.map((wo) => {
        const isStuck = wo.status === 'open' && new Date(wo.created_at) < sevenDaysAgo;
        return {
          entityType: 'work_order',
          entityId: wo.id,
          status: wo.status,
          priority: wo.priority,
          createdAt: wo.created_at.slice(0, 10),
          stuckOpenOver7Days: isStuck ? 'Yes' : 'No',
        };
      }),
    ],
    complianceScore,
    complianceBreakdown: {
      inspectionTimeliness: indicator1,
      criticalDefectResolution: indicator2,
      workOrderFlowHealth: indicator3,
      message,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Route handlers                                                     */
/* ------------------------------------------------------------------ */

/** GET /api/reports — list previously generated reports */
async function list(_req: Request, res: Response): Promise<void> {
  const reports = [...runtimeReports]
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));

  res.json({
    data: reports.map((r) => ({
      id: r.id,
      type: r.type,
      dateFrom: r.dateFrom,
      dateTo: r.dateTo,
      plantId: r.plantId,
      generatedAt: r.generatedAt,
      generatedBy: r.generatedBy,
    })),
    total: reports.length,
  });
}

/** POST /api/reports/generate — generate a new report */
async function generate(req: AuthedRequest, res: Response): Promise<void> {
  const {
    type,
    dateFrom = null,
    dateTo = null,
    plantId = null,
  } = req.body ?? {};

  const validTypes: ReportType[] = ['inspection', 'defect', 'maintenance', 'compliance'];
  if (!type || !validTypes.includes(type as ReportType)) {
    res.status(400).json({
      message: `Invalid or missing "type". Must be one of: ${validTypes.join(', ')}`,
    });
    return;
  }

  const reportType = type as ReportType;
  const now = new Date().toISOString();
  const userId = req.user?.id ?? '00000000-0000-0000-0000-000000000000';

  // Fetch and filter source data
  const allInsp = allInspections().filter((i) => inDateRange(i, dateFrom, dateTo));
  const allDefs = allDefects().filter((d) => inDateRange(d, dateFrom, dateTo));
  const allWos = allWorkOrders().filter((wo) => inDateRange(wo, dateFrom, dateTo));

  const filteredInsp = filterByPlant(allInsp, plantId);
  const filteredDefs = filterByPlant(allDefs, plantId);
  const filteredWos = plantId
    ? allWos.filter((wo) => {
        const defect = allDefects().find((d) => d.id === wo.defect_id);
        return defect ? assetPlantId(defect.asset_id) === plantId : false;
      })
    : allWos;

  let data: ReportData;

  switch (reportType) {
    case 'inspection':
      data = buildInspectionReport(filteredInsp);
      break;
    case 'defect':
      data = buildDefectReport(filteredDefs);
      break;
    case 'maintenance':
      data = buildMaintenanceReport(filteredWos);
      break;
    case 'compliance':
      data = buildComplianceReport(filteredInsp, filteredDefs, filteredWos);
      break;
  }

  const report: GeneratedReport = {
    id: randomUUID(),
    type: reportType,
    dateFrom,
    dateTo,
    plantId,
    generatedAt: now,
    generatedBy: userId,
    data,
  };

  runtimeReports.push(report);

  // Audit log entry for traceability
  runtimeAuditLogs.push({
    id: randomUUID(),
    user_id: userId,
    action: 'report_generated',
    entity_type: 'report',
    entity_id: report.id,
    metadata: {
      type: reportType,
      dateFrom,
      dateTo,
      plantId,
    },
    created_at: now,
  });

  res.status(201).json(report);
}

/** GET /api/reports/:id — preview a generated report */
async function get(req: Request, res: Response): Promise<void> {
  const report = runtimeReports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ message: 'Report not found' });
    return;
  }
  res.json(report);
}

/** GET /api/reports/:id/export?format=csv — CSV download */
async function exportCsv(req: Request, res: Response): Promise<void> {
  const report = runtimeReports.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ message: 'Report not found' });
    return;
  }

  const csv = toCsv(report.data.rows);
  const plantLabel = report.plantId
    ? seedPlants.find((p) => p.id === report.plantId)?.name ?? report.plantId
    : 'All Plants';
  const filename = `${report.type}_report_${plantLabel.replace(/\s+/g, '_')}_${report.generatedAt.slice(0, 10)}.csv`;

  res
    .setHeader('Content-Type', 'text/csv; charset=utf-8')
    .setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    .send(csv);
}

export const reportsController = { list, generate, get, exportCsv };