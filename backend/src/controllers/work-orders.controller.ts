import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import {
  allWorkOrders,
  notifyUser,
  runtimeAuditLogs,
  runtimeWorkOrders,
  seedAssets,
  seedDefects,
  seedPlants,
  seedUsers,
} from '../repositories/memory-store.js';
import type { AuthedRequest } from '../middleware/auth.js';
import type { Defect, MaintenanceUpdate, WorkOrder } from '../types/domain.js';

/**
 * Work Orders controller — Week 4 implementation.
 *
 * Endpoints:
 *   GET    /api/work-orders           → paginated list with status/priority/plant filters
 *   GET    /api/work-orders/:id        → single work order detail (joins defect + asset + assignee + notes)
 *   PATCH  /api/work-orders/:id/status → advance status (assigned→in_progress, in_progress→completed)
 *   PATCH  /api/work-orders/:id/assign → assign a technician + set status to "assigned" (single atomic action)
 *   POST   /api/work-orders/:id/notes  → add a maintenance note
 *
 * Status machine:
 *   open → assigned (ONLY via assign endpoint)
 *   assigned → in_progress (via status endpoint)
 *   in_progress → completed (via status endpoint)
 */

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

type WOStatus = WorkOrder['status'];

const VALID_STATUSES: WOStatus[] = ['open', 'assigned', 'in_progress', 'completed'];

const STATUS_TRANSITIONS: Record<WOStatus, WOStatus | null> = {
  open: 'assigned',
  assigned: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

function parseIntParam(value: unknown, fallback: number, min = 1, max = Infinity): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

// --- DTO helpers ---------------------------------------------------------

interface WorkOrderDto {
  id: string;
  defectId: string;
  defect: {
    id: string;
    description: string;
    severity: Defect['severity'];
    category: string;
  } | null;
  assignedTo: string | null;
  assigneeName: string | null;
  priority: WorkOrder['priority'];
  status: WOStatus;
  deadline: string | null;
  createdAt: string;
}

function toWorkOrderDto(wo: WorkOrder): WorkOrderDto {
  const defect = seedDefects.find((d) => d.id === wo.defect_id);
  const assignee = wo.assigned_to ? seedUsers.find((u) => u.id === wo.assigned_to) : undefined;
  return {
    id: wo.id,
    defectId: wo.defect_id,
    defect: defect
      ? { id: defect.id, description: defect.description, severity: defect.severity, category: defect.category }
      : null,
    assignedTo: wo.assigned_to,
    assigneeName: assignee ? assignee.full_name : null,
    priority: wo.priority,
    status: wo.status,
    deadline: wo.deadline,
    createdAt: wo.created_at,
  };
}

// =========================================================================
// Runtime maintenance notes store
// =========================================================================

const notes: MaintenanceUpdate[] = [];

// =========================================================================
// Controllers
// =========================================================================

/** GET /api/work-orders — paginated list with optional filters */
async function list(req: Request, res: Response): Promise<void> {
  const page = parseIntParam(req.query.page, 1) - 1;
  const pageSize = parseIntParam(req.query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
  const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
  const priorityFilter = typeof req.query.priority === 'string' ? req.query.priority : undefined;
  const plantIdFilter = typeof req.query.plantId === 'string' ? req.query.plantId : undefined;

  let orders = allWorkOrders();

  if (statusFilter) {
    const allowed = new Set(statusFilter.split(','));
    orders = orders.filter((wo) => allowed.has(wo.status));
  }

  if (priorityFilter) {
    const allowed = new Set(priorityFilter.split(','));
    orders = orders.filter((wo) => allowed.has(wo.priority));
  }

  if (plantIdFilter) {
    orders = orders.filter((wo) => {
      const defect = seedDefects.find((d) => d.id === wo.defect_id);
      if (!defect) return false;
      const asset = seedAssets.find((a) => a.id === defect.asset_id);
      return asset?.plant_id === plantIdFilter;
    });
  }

  orders.sort((a, b) => b.created_at.localeCompare(a.created_at));

  const total = orders.length;
  const data = orders.slice(page * pageSize, (page + 1) * pageSize).map(toWorkOrderDto);

  res.json({
    data,
    total,
    page: page + 1,
    pageSize,
  });
}

/** GET /api/work-orders/:id — single work order with defect + asset + notes */
async function get(req: Request, res: Response): Promise<void> {
  const wo = allWorkOrders().find((w) => w.id === req.params.id);
  if (!wo) {
    res.status(404).json({ message: 'Work order not found' });
    return;
  }

  // Join: defect → asset → plant
  const defect = seedDefects.find((d) => d.id === wo.defect_id);
  let assetDto: {
    id: string;
    assetCode: string;
    name: string;
    plantName: string | null;
  } | null = null;
  if (defect) {
    const asset = seedAssets.find((a) => a.id === defect.asset_id);
    if (asset) {
      const plant = seedPlants.find((p) => p.id === asset.plant_id);
      assetDto = {
        id: asset.id,
        assetCode: asset.asset_code,
        name: asset.name,
        plantName: plant ? plant.name : null,
      };
    }
  }

  const dto = toWorkOrderDto(wo);
  const notesForWo = notes
    .filter((n) => n.work_order_id === wo.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .map((n) => ({
      id: n.id,
      technicianId: n.technician_id,
      technicianName: seedUsers.find((u) => u.id === n.technician_id)?.full_name ?? null,
      note: n.note,
      statusChangeTo: n.status_change_to,
      createdAt: n.created_at,
    }));

  res.json({ ...dto, asset: assetDto, notes: notesForWo });
}

/** PATCH /api/work-orders/:id/status — advance to next status */
async function updateStatus(req: AuthedRequest, res: Response): Promise<void> {
  const wo = allWorkOrders().find((w) => w.id === req.params.id);
  if (!wo) {
    res.status(404).json({ message: 'Work order not found' });
    return;
  }

  // Block open→assigned via the generic status endpoint — assignment
  // must go through the dedicated PATCH /:id/assign endpoint which
  // sets both assigned_to and status atomically.
  if (wo.status === 'open') {
    res.status(400).json({
      message: 'Cannot advance from "open" via the status endpoint. Use the Assign action to assign a technician first.',
    });
    return;
  }

  const nextStatus: WOStatus | null = STATUS_TRANSITIONS[wo.status];
  if (!nextStatus) {
    res.status(400).json({
      message: `Work order is already in terminal status "${wo.status}". No further transitions allowed.`,
    });
    return;
  }

  const { status: requestedStatus } = req.body ?? {};
  if (requestedStatus !== nextStatus) {
    res.status(400).json({
      message: `Cannot transition from "${wo.status}" to "${requestedStatus}". Allowed: "${nextStatus}".`,
    });
    return;
  }

  const previousStatus = wo.status;
  const now = new Date().toISOString();

  const runtimeWo = runtimeWorkOrders.find((w) => w.id === wo.id);
  wo.status = nextStatus;
  if (runtimeWo) runtimeWo.status = nextStatus;

  // Auto-assign on in_progress if unassigned
  if (nextStatus === 'in_progress' && !wo.assigned_to && req.user?.role === 'technician') {
    wo.assigned_to = req.user.id;
    if (runtimeWo) runtimeWo.assigned_to = req.user.id;
  }

  runtimeAuditLogs.push({
    id: randomUUID(),
    user_id: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
    action: 'work_order_status_changed',
    entity_type: 'work_order',
    entity_id: wo.id,
    metadata: { from: previousStatus, to: nextStatus },
    created_at: now,
  });

  // Notify the defect reporter when the work order is completed
  if (nextStatus === 'completed') {
    const defect = seedDefects.find((d) => d.id === wo.defect_id);
    if (defect) {
      notifyUser(defect.reported_by, {
        id: randomUUID(),
        user_id: defect.reported_by,
        type: 'work_order_completed',
        message: `Work order for defect "${defect.description.slice(0, 60)}" has been completed.`,
        entity_type: 'work_order',
        entity_id: wo.id,
        read: false,
        created_at: now,
      });
    }
  }

  res.json(toWorkOrderDto(wo));
}

/** PATCH /api/work-orders/:id/assign — atomic: set assigned_to + status='assigned' */
async function assign(req: AuthedRequest, res: Response): Promise<void> {
  const wo = allWorkOrders().find((w) => w.id === req.params.id);
  if (!wo) {
    res.status(404).json({ message: 'Work order not found' });
    return;
  }

  if (wo.status !== 'open') {
    res.status(400).json({
      message: `Cannot assign a work order with status "${wo.status}". Must be "open".`,
    });
    return;
  }

  const { technicianId } = req.body ?? {};
  if (!technicianId || typeof technicianId !== 'string') {
    res.status(400).json({ message: 'Missing required field: technicianId' });
    return;
  }

  const technician = seedUsers.find((u) => u.id === technicianId);
  if (!technician) {
    res.status(404).json({ message: `Technician not found: ${technicianId}` });
    return;
  }

  const previousStatus = wo.status;
  const now = new Date().toISOString();

  const runtimeWo = runtimeWorkOrders.find((w) => w.id === wo.id);
  wo.assigned_to = technicianId;
  wo.status = 'assigned';
  if (runtimeWo) {
    runtimeWo.assigned_to = technicianId;
    runtimeWo.status = 'assigned';
  }

  // Audit log
  runtimeAuditLogs.push({
    id: randomUUID(),
    user_id: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
    action: 'work_order_assigned',
    entity_type: 'work_order',
    entity_id: wo.id,
    metadata: { technicianId, previousStatus },
    created_at: now,
  });

  // Notify the assigned technician
  notifyUser(technicianId, {
    id: randomUUID(),
    user_id: technicianId,
    type: 'work_order_assigned',
    message: `New work order assigned to you: ${seedDefects.find((d) => d.id === wo.defect_id)?.description.slice(0, 60) ?? 'Unknown defect'}`,
    entity_type: 'work_order',
    entity_id: wo.id,
    read: false,
    created_at: now,
  });

  res.json(toWorkOrderDto(wo));
}

/** POST /api/work-orders/:id/notes — add a maintenance note */
async function addNote(req: AuthedRequest, res: Response): Promise<void> {
  const wo = allWorkOrders().find((w) => w.id === req.params.id);
  if (!wo) {
    res.status(404).json({ message: 'Work order not found' });
    return;
  }

  const { note, statusChangeTo } = req.body ?? {};
  if (!note || typeof note !== 'string' || note.trim().length === 0) {
    res.status(400).json({ message: 'Missing required field: note (non-empty string)' });
    return;
  }

  // Validate statusChangeTo if provided
  if (statusChangeTo !== undefined && statusChangeTo !== null) {
    if (!VALID_STATUSES.includes(statusChangeTo as WOStatus)) {
      res.status(400).json({
        message: `Invalid statusChangeTo: "${statusChangeTo}". Must be one of: ${VALID_STATUSES.join(', ')}`,
      });
      return;
    }
    // Block open→assigned via note — must use the Assign endpoint
    if (wo.status === 'open' && statusChangeTo === 'assigned') {
      res.status(400).json({
        message: 'Cannot assign via note. Use the Assign action to assign a technician first.',
      });
      return;
    }
    const expected = STATUS_TRANSITIONS[wo.status];
    if (statusChangeTo !== expected && statusChangeTo !== wo.status) {
      res.status(400).json({
        message: `Cannot change status from "${wo.status}" to "${statusChangeTo}" via note. Use the status endpoint instead.`,
      });
      return;
    }
  }

  const now = new Date().toISOString();
  const update: MaintenanceUpdate = {
    id: randomUUID(),
    work_order_id: wo.id,
    technician_id: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
    note: note.trim(),
    status_change_to: (statusChangeTo as WOStatus) ?? null,
    created_at: now,
  };
  notes.push(update);

  // If statusChangeTo was provided, update WO status
  if (statusChangeTo) {
    const previousStatus = wo.status;
    const runtimeWo = runtimeWorkOrders.find((w) => w.id === wo.id);
    wo.status = statusChangeTo as WOStatus;
    if (runtimeWo) runtimeWo.status = statusChangeTo as WOStatus;

    runtimeAuditLogs.push({
      id: randomUUID(),
      user_id: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
      action: 'work_order_status_changed',
      entity_type: 'work_order',
      entity_id: wo.id,
      metadata: { from: previousStatus, to: statusChangeTo, note: update.note },
      created_at: now,
    });
  }

  // Audit log for the note itself
  runtimeAuditLogs.push({
    id: randomUUID(),
    user_id: req.user?.id ?? '00000000-0000-0000-0000-000000000000',
    action: 'maintenance_note_added',
    entity_type: 'work_order',
    entity_id: wo.id,
    metadata: { noteId: update.id },
    created_at: now,
  });

  res.status(201).json({
    id: update.id,
    technicianId: update.technician_id,
    technicianName: seedUsers.find((u) => u.id === update.technician_id)?.full_name ?? null,
    note: update.note,
    statusChangeTo: update.status_change_to,
    createdAt: update.created_at,
  });
}

export const workOrdersController = { list, get, updateStatus, assign, addNote };