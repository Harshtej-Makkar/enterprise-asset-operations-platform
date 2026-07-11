import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  allDefects,
  runtimeAuditLogs,
  runtimeDefects,
  runtimeNotifications,
  runtimeWorkOrders,
  seedAssets,
  seedUsers,
} from '../repositories/memory-store.js';
import type { AuthedRequest } from '../middleware/auth.js';
import type { Approval, Defect, DefectStatus, WorkOrder, WorkOrderPriority } from '../types/domain.js';
import { toDefectDto } from '../mappers/domain-dtos.js';

/**
 * Defects controller — Week 3 implementation.
 *
 * Endpoints:
 *   GET  /api/defects          → paginated list with severity/status/plant filters
 *   GET  /api/defects/:id       → single defect detail
 *   POST /api/defects           → create (log) a new defect
 *   POST /api/defects/:id/approval → approve or reject a critical defect
 */

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

function parseIntParam(value: unknown, fallback: number, min = 1, max = Infinity): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

const ALLOWED_APPROVAL_ROLES = new Set(['admin', 'plant_manager', 'supervisor']);

function severityToPriority(severity: Defect['severity']): WorkOrderPriority {
  switch (severity) {
    case 'critical': return 'urgent';
    case 'high':     return 'high';
    case 'medium':   return 'medium';
    case 'low':      return 'low';
  }
}

/**
 * Runtime approvals store. Not persisted to disk — lives in process memory
 * alongside runtimeDefects / runtimeWorkOrders.
 */
const approvals: Approval[] = [];

/** GET /api/defects — paginated list with optional filters */
async function list(req: Request, res: Response): Promise<void> {
  const page = parseIntParam(req.query.page, 1) - 1; // 0-indexed
  const pageSize = parseIntParam(req.query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const severityFilter = typeof req.query.severity === 'string' ? req.query.severity : undefined;
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
  const plantIdFilter = typeof req.query.plantId === 'string' ? req.query.plantId : undefined;

  let defects = allDefects();

  // Severity filter — if multiple, comma-separated
  if (severityFilter) {
    const allowed = new Set(severityFilter.split(','));
    defects = defects.filter((d) => allowed.has(d.severity));
  }

  // Status filter — if multiple, comma-separated
  if (statusFilter) {
    const allowed = new Set(statusFilter.split(','));
    defects = defects.filter((d) => allowed.has(d.status));
  }

  // Plant filter — join through asset
  if (plantIdFilter) {
    defects = defects.filter((d) => {
      const asset = seedAssets.find((a) => a.id === d.asset_id);
      return asset?.plant_id === plantIdFilter;
    });
  }

  // Sort newest-first
  defects.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const total = defects.length;
  const data = defects.slice(page * pageSize, (page + 1) * pageSize).map(toDefectDto);

  res.json({
    data,
    pagination: { page: page + 1, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  });
}

/** GET /api/defects/:id — single defect */
async function get(req: Request, res: Response): Promise<void> {
  const defect = allDefects().find((d) => d.id === req.params.id);
  if (!defect) {
    res.status(404).json({ message: 'Defect not found' });
    return;
  }
  res.json(toDefectDto(defect));
}

/** POST /api/defects — create a new defect */
async function create(req: AuthedRequest, res: Response): Promise<void> {
  const { assetId, inspectionId, severity, category, description, photoUrls } = req.body ?? {};

  // Validation
  if (!assetId || !severity || !category || !description) {
    res.status(400).json({
      message: 'Missing required fields: assetId, severity, category, description',
    });
    return;
  }

  const validSeverities: Defect['severity'][] = ['low', 'medium', 'high', 'critical'];
  if (!validSeverities.includes(severity as Defect['severity'])) {
    res.status(400).json({
      message: `Invalid severity: "${severity}". Must be one of: ${validSeverities.join(', ')}`,
    });
    return;
  }

  // Verify the asset exists
  const asset = seedAssets.find((a) => a.id === assetId);
  if (!asset) {
    res.status(404).json({ message: `Asset not found: ${assetId}` });
    return;
  }

  // Determine initial status: critical → pending_approval, otherwise → open
  const initialStatus: DefectStatus = severity === 'critical' ? 'pending_approval' : 'open';

  const now = new Date().toISOString();
  const defect: Defect = {
    id: randomUUID(),
    asset_id: assetId,
    inspection_id: inspectionId ?? null,
    reported_by: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
    severity: severity as Defect['severity'],
    category,
    description,
    photo_urls: Array.isArray(photoUrls) ? photoUrls : [],
    status: initialStatus,
    created_at: now,
  };

  runtimeDefects.push(defect);

  // Audit log
  runtimeAuditLogs.push({
    id: randomUUID(),
    user_id: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
    action: 'defect_logged',
    entity_type: 'defect',
    entity_id: defect.id,
    metadata: { severity: defect.severity },
    created_at: now,
  });

  // If critical, notify supervisors / plant managers
  if (initialStatus === 'pending_approval') {
    seedUsers
      .filter((u) => ALLOWED_APPROVAL_ROLES.has(u.role))
      .forEach((u) => {
        runtimeNotifications.push({
          id: randomUUID(),
          user_id: u.id,
          type: 'defect_critical',
          message: `Critical defect awaiting approval: ${defect.description.slice(0, 80)}`,
          entity_type: 'defect',
          entity_id: defect.id,
          read: false,
          created_at: now,
        });
      });
  }

  res.status(201).json(toDefectDto(defect));
}

/** POST /api/defects/:id/approval — approve or reject a critical defect */
async function approve(req: AuthedRequest, res: Response): Promise<void> {
  const { decision, comment } = req.body ?? {};
  const defectId = req.params.id;
  const approverId = req.user?.id;

  // Role gate
  if (!req.user || !ALLOWED_APPROVAL_ROLES.has(req.user.role)) {
    res.status(403).json({
      message: 'Only Supervisor, Plant Manager, or Admin can approve/reject defects.',
    });
    return;
  }

  // Validate decision
  if (decision !== 'approved' && decision !== 'rejected') {
    res.status(400).json({
      message: `Invalid decision: "${decision}". Must be "approved" or "rejected".`,
    });
    return;
  }

  // Rejection requires a comment
  if (decision === 'rejected' && (!comment || String(comment).trim().length === 0)) {
    res.status(400).json({
      message: 'A comment is required when rejecting a defect.',
    });
    return;
  }

  // Find the defect
  const defect = allDefects().find((d) => d.id === defectId);
  if (!defect) {
    res.status(404).json({ message: 'Defect not found' });
    return;
  }

  // Only critical defects go through approval
  if (defect.severity !== 'critical') {
    res.status(400).json({
      message: 'Only Critical-severity defects require approval.',
    });
    return;
  }

  // Only pending_approval defects can be approved/rejected
  if (defect.status !== 'pending_approval') {
    res.status(400).json({
      message: `Defect status is "${defect.status}", not "pending_approval". Cannot approve/reject.`,
    });
    return;
  }

  const now = new Date().toISOString();

  // 1. Create the Approval record
  const approval: Approval = {
    id: randomUUID(),
    defect_id: defectId,
    approver_id: approverId ?? '00000000-0000-0000-0000-000000000000',
    decision,
    comment: comment && String(comment).trim().length > 0 ? String(comment).trim() : null,
    decided_at: now,
  };
  approvals.push(approval);

  if (decision === 'approved') {
    // 2a. Set defect status to approved
    defect.status = 'approved';

    // 2b. Log the approval audit entry
    runtimeAuditLogs.push({
      id: randomUUID(),
      user_id: approverId ?? '00000000-0000-0000-0000-000000000000',
      action: 'defect_approved',
      entity_type: 'defect',
      entity_id: defectId,
      metadata: {
        decision: 'approved',
        comment: approval.comment,
      },
      created_at: now,
    });

    // 3. Auto-create a Work Order
    const workOrderId = randomUUID();
    const workOrder: WorkOrder = {
      id: workOrderId,
      defect_id: defectId,
      assigned_to: null,
      priority: severityToPriority(defect.severity),
      status: 'open',
      deadline: null,
      created_at: now,
    };
    runtimeWorkOrders.push(workOrder);

    // 4. Set defect status to work_order_created
    defect.status = 'work_order_created';

    // 5. Log work order creation audit entry
    runtimeAuditLogs.push({
      id: randomUUID(),
      user_id: approverId ?? '00000000-0000-0000-0000-000000000000',
      action: 'work_order_created',
      entity_type: 'work_order',
      entity_id: workOrderId,
      metadata: {
        defect_id: defectId,
        priority: workOrder.priority,
        auto_created_from_approval: true,
      },
      created_at: now,
    });

    // 6. Notify the defect reporter
    runtimeNotifications.push({
      id: randomUUID(),
      user_id: defect.reported_by,
      type: 'defect_approved',
      message: `Your defect report has been approved. A work order has been created.`,
      entity_type: 'defect',
      entity_id: defectId,
      read: false,
      created_at: now,
    });
  } else {
    // Rejection path
    defect.status = 'rejected';

    // Log rejection audit entry
    runtimeAuditLogs.push({
      id: randomUUID(),
      user_id: approverId ?? '00000000-0000-0000-0000-000000000000',
      action: 'defect_rejected',
      entity_type: 'defect',
      entity_id: defectId,
      metadata: {
        decision: 'rejected',
        comment: approval.comment,
      },
      created_at: now,
    });

    // Notify the reporter
    runtimeNotifications.push({
      id: randomUUID(),
      user_id: defect.reported_by,
      type: 'defect_rejected',
      message: `Your defect report was rejected. Reason: ${approval.comment ?? 'No comment provided.'}`,
      entity_type: 'defect',
      entity_id: defectId,
      read: false,
      created_at: now,
    });
  }

  // Return the approval record as the API response
  res.status(201).json({
    id: approval.id,
    defectId: approval.defect_id,
    approverId: approval.approver_id,
    decision: approval.decision,
    comment: approval.comment,
    decidedAt: approval.decided_at,
  });
}

export const defectsController = { list, get, create, approve };