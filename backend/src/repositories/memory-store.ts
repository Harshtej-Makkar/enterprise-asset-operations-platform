import bcrypt from 'bcryptjs';
import type {
  Asset,
  AuditLog,
  Defect,
  Inspection,
  Notification,
  Plant,
  User,
  WorkOrder,
} from '../types/domain.js';
import type { GeneratedReport } from '../controllers/reports.controller.js';

/**
 * In-memory seed store.
 *
 * This is the simplest possible stand-in for a database — a fixed set of
 * records derived from database/seed/seed.sql. It exists so that the
 * frontend can be demoed end-to-end without requiring the contributor to
 * set up PostgreSQL locally (FSMOD §16 — keep the mock backend honest
 * but minimal).
 *
 * Numbers are calibrated to be interesting on Day 1:
 *  - 3 plants, 20 assets, 5 asset types
 *  - 1 checklist template per asset type
 *  - inspections across pass/fail/pending/overdue
 *  - defects across all 4 severities and all 6 statuses
 *  - work orders in all 4 Kanban columns
 *  - 5 demo users covering every role
 */

export const seedUsers: User[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    full_name: 'System Administrator',
    email: 'admin@eaop.local',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'admin',
    plant_id: null,
    status: 'active',
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-01T08:00:00Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    full_name: 'Priya Deshpande',
    email: 'plant.manager@eaop.local',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'plant_manager',
    plant_id: 'aaaaaaaa-0000-0000-0000-000000000001',
    status: 'active',
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-01T08:00:00Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    full_name: 'Rajesh Kulkarni',
    email: 'supervisor@eaop.local',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'supervisor',
    plant_id: 'aaaaaaaa-0000-0000-0000-000000000001',
    status: 'active',
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-01T08:00:00Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    full_name: 'Anita Joshi',
    email: 'inspector@eaop.local',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'inspector',
    plant_id: 'aaaaaaaa-0000-0000-0000-000000000001',
    status: 'active',
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-01T08:00:00Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    full_name: 'Vikram Patil',
    email: 'technician@eaop.local',
    password_hash: bcrypt.hashSync('password123', 10),
    role: 'technician',
    plant_id: 'aaaaaaaa-0000-0000-0000-000000000001',
    status: 'active',
    created_at: '2026-06-01T08:00:00Z',
    updated_at: '2026-06-01T08:00:00Z',
  },
];

export const seedPlants: Plant[] = [
  { id: 'aaaaaaaa-0000-0000-0000-000000000001', name: 'Pune Plant',     city: 'Pune',   address: 'Plot 4, MIDC Phase II, Pune',     status: 'active' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000002', name: 'Chakan Plant',   city: 'Chakan', address: 'Plot 22, Chakan Industrial Area',   status: 'active' },
  { id: 'aaaaaaaa-0000-0000-0000-000000000003', name: 'Nashik Plant',   city: 'Nashik', address: 'Plot 9, Sinnar MIDC, Nashik',       status: 'active' },
];

// Asset type list — defined in the Week 2 section below as a strongly-typed
// `AssetTypeRecord[]`. The re-export of `seedAssetTypes` is provided at the
// bottom of this file.

function makeAsset(i: number, plantId: string, typeId: string, code: string, name: string, dept: string): Asset {
  return {
    id: `cccccccc-${String(i).padStart(4, '0')}-0000-0000-000000000000`,
    asset_code: code,
    name,
    asset_type_id: typeId,
    plant_id: plantId,
    department: dept,
    status: i % 7 === 0 ? 'under_maintenance' : 'active',
    created_at: '2026-05-15T10:00:00Z',
  };
}

export const seedAssets: Asset[] = [
  // Pune
  makeAsset(1,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'PUN-HP-001', 'Hydraulic Press A1',  'Body Shop'),
  makeAsset(2,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000001', 'PUN-HP-002', 'Hydraulic Press A2',  'Body Shop'),
  makeAsset(3,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'PUN-CM-001', 'Conveyor Motor M-12', 'Assembly'),
  makeAsset(4,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000002', 'PUN-CM-002', 'Conveyor Motor M-13', 'Assembly'),
  makeAsset(5,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', 'PUN-AC-001', 'Air Compressor C-1',  'Utilities'),
  makeAsset(6,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000003', 'PUN-AC-002', 'Air Compressor C-2',  'Utilities'),
  makeAsset(7,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000004', 'PUN-BO-001', 'Steam Boiler B-1',    'Utilities'),
  makeAsset(8,  'aaaaaaaa-0000-0000-0000-000000000001', 'bbbbbbbb-0000-0000-0000-000000000005', 'PUN-CN-001', 'CNC Lathe L-1',       'Machining'),
  // Chakan
  makeAsset(9,  'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'CHK-HP-001', 'Hydraulic Press B1',  'Stamping'),
  makeAsset(10, 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000001', 'CHK-HP-002', 'Hydraulic Press B2',  'Stamping'),
  makeAsset(11, 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', 'CHK-CM-001', 'Conveyor Motor M-21', 'Paint Shop'),
  makeAsset(12, 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000002', 'CHK-CM-002', 'Conveyor Motor M-22', 'Paint Shop'),
  makeAsset(13, 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000003', 'CHK-AC-001', 'Air Compressor C-3',  'Utilities'),
  makeAsset(14, 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000005', 'CHK-CN-001', 'CNC Mill M-1',        'Machining'),
  makeAsset(15, 'aaaaaaaa-0000-0000-0000-000000000002', 'bbbbbbbb-0000-0000-0000-000000000005', 'CHK-CN-002', 'CNC Mill M-2',        'Machining'),
  // Nashik
  makeAsset(16, 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000001', 'NSK-HP-001', 'Hydraulic Press C1',  'Forging'),
  makeAsset(17, 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000002', 'NSK-CM-001', 'Conveyor Motor M-31', 'Assembly'),
  makeAsset(18, 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000003', 'NSK-AC-001', 'Air Compressor C-4',  'Utilities'),
  makeAsset(19, 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000004', 'NSK-BO-001', 'Steam Boiler B-2',    'Utilities'),
  makeAsset(20, 'aaaaaaaa-0000-0000-0000-000000000003', 'bbbbbbbb-0000-0000-0000-000000000005', 'NSK-CN-001', 'CNC Lathe L-2',       'Machining'),
];

export const seedInspections: Inspection[] = [
  // completed-pass
  { id: 'dddddddd-0000-0000-0000-000000000001', asset_id: 'cccccccc-0001-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-06-25', completed_at: '2026-06-25T10:30:00Z', overall_result: 'pass' },
  { id: 'dddddddd-0000-0000-0000-000000000002', asset_id: 'cccccccc-0002-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-06-25', completed_at: '2026-06-25T11:15:00Z', overall_result: 'pass' },
  // completed-fail
  { id: 'dddddddd-0000-0000-0000-000000000003', asset_id: 'cccccccc-0003-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-06-26', completed_at: '2026-06-26T09:00:00Z', overall_result: 'fail' },
  { id: 'dddddddd-0000-0000-0000-000000000004', asset_id: 'cccccccc-0007-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-06-26', completed_at: '2026-06-26T14:00:00Z', overall_result: 'fail' },
  // pending
  { id: 'dddddddd-0000-0000-0000-000000000005', asset_id: 'cccccccc-0005-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-07-08', completed_at: null, overall_result: 'pending' },
  { id: 'dddddddd-0000-0000-0000-000000000006', asset_id: 'cccccccc-0006-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-07-09', completed_at: null, overall_result: 'pending' },
  // overdue
  { id: 'dddddddd-0000-0000-0000-000000000007', asset_id: 'cccccccc-0010-0000-0000-000000000000', inspector_id: '44444444-4444-4444-4444-444444444444', scheduled_date: '2026-07-03', completed_at: null, overall_result: 'pending' },
];

export const seedDefects: Defect[] = [
  { id: 'eeeeeeee-0001-0000-0000-000000000000', asset_id: 'cccccccc-0003-0000-0000-000000000000', inspection_id: 'dddddddd-0000-0000-0000-000000000003', reported_by: '44444444-4444-4444-4444-444444444444', severity: 'medium',  category: 'Mechanical', description: 'Conveyor belt showing visible fraying on the drive side.', photo_urls: [], status: 'open',                created_at: '2026-06-26T09:30:00Z' },
  { id: 'eeeeeeee-0002-0000-0000-000000000000', asset_id: 'cccccccc-0007-0000-0000-000000000000', inspection_id: 'dddddddd-0000-0000-0000-000000000004', reported_by: '44444444-4444-4444-4444-444444444444', severity: 'critical', category: 'Safety',    description: 'Pressure relief valve reading outside tolerance — immediate attention required.', photo_urls: [], status: 'pending_approval',   created_at: '2026-06-26T14:15:00Z' },
  { id: 'eeeeeeee-0003-0000-0000-000000000000', asset_id: 'cccccccc-0009-0000-0000-000000000000', inspection_id: null, reported_by: '44444444-4444-4444-4444-444444444444', severity: 'critical', category: 'Hydraulic', description: 'Hydraulic fluid leak detected at the main cylinder seal.',                  photo_urls: [], status: 'pending_approval',   created_at: '2026-06-28T08:00:00Z' },
  { id: 'eeeeeeee-0004-0000-0000-000000000000', asset_id: 'cccccccc-0011-0000-0000-000000000000', inspection_id: null, reported_by: '44444444-4444-4444-4444-444444444444', severity: 'critical', category: 'Electrical',description: 'Overheating noted on motor windings during operation.',                       photo_urls: [], status: 'pending_approval',   created_at: '2026-06-30T10:45:00Z' },
  { id: 'eeeeeeee-0005-0000-0000-000000000000', asset_id: 'cccccccc-0005-0000-0000-000000000000', inspection_id: null, reported_by: '44444444-4444-4444-4444-444444444444', severity: 'low',     category: 'Consumable', description: 'Air filter due for replacement (service interval reached).',                 photo_urls: [], status: 'work_order_created',created_at: '2026-06-20T11:00:00Z' },
  { id: 'eeeeeeee-0006-0000-0000-000000000000', asset_id: 'cccccccc-0001-0000-0000-000000000000', inspection_id: null, reported_by: '44444444-4444-4444-4444-444444444444', severity: 'high',    category: 'Mechanical', description: 'Press die alignment drift detected, requires calibration.',                  photo_urls: [], status: 'work_order_created',created_at: '2026-06-22T13:30:00Z' },
  { id: 'eeeeeeee-0007-0000-0000-000000000000', asset_id: 'cccccccc-0014-0000-0000-000000000000', inspection_id: null, reported_by: '44444444-4444-4444-4444-444444444444', severity: 'medium',  category: 'Tooling',    description: 'Spindle vibration above acceptable limit.',                                   photo_urls: [], status: 'rejected',          created_at: '2026-06-18T16:20:00Z' },
  { id: 'eeeeeeee-0008-0000-0000-000000000000', asset_id: 'cccccccc-0004-0000-0000-000000000000', inspection_id: null, reported_by: '44444444-4444-4444-4444-444444444444', severity: 'low',     category: 'Lubrication', description: 'Bearing lubrication overdue per maintenance schedule.',                      photo_urls: [], status: 'resolved',          created_at: '2026-06-10T09:00:00Z' },
];

export const seedWorkOrders: WorkOrder[] = [
  // Open
  { id: 'ffffffff-0001-0000-0000-000000000000', defect_id: 'eeeeeeee-0005-0000-0000-000000000000', assigned_to: null,                                  priority: 'low',     status: 'open',        deadline: '2026-07-15', created_at: '2026-06-20T11:05:00Z' },
  { id: 'ffffffff-0002-0000-0000-000000000000', defect_id: 'eeeeeeee-0006-0000-0000-000000000000', assigned_to: null,                                  priority: 'high',    status: 'open',        deadline: '2026-07-12', created_at: '2026-06-22T13:35:00Z' },
  // Assigned
  { id: 'ffffffff-0003-0000-0000-000000000000', defect_id: 'eeeeeeee-0001-0000-0000-000000000000', assigned_to: '55555555-5555-5555-5555-555555555555', priority: 'medium',  status: 'assigned',    deadline: '2026-07-10', created_at: '2026-06-26T10:00:00Z' },
  // In Progress
  { id: 'ffffffff-0004-0000-0000-000000000000', defect_id: 'eeeeeeee-0008-0000-0000-000000000000', assigned_to: '55555555-5555-5555-5555-555555555555', priority: 'low',     status: 'in_progress', deadline: '2026-07-05', created_at: '2026-06-10T09:30:00Z' },
  // Completed
  { id: 'ffffffff-0005-0000-0000-000000000000', defect_id: 'eeeeeeee-0008-0000-0000-000000000000', assigned_to: '55555555-5555-5555-5555-555555555555', priority: 'low',     status: 'completed',   deadline: '2026-06-25', created_at: '2026-06-10T10:00:00Z' },
];

export const seedAuditLogs: AuditLog[] = [
  { id: '99999999-0001-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', action: 'inspection_submitted',     entity_type: 'inspection', entity_id: 'dddddddd-0000-0000-0000-000000000001', metadata: { result: 'pass' }, created_at: '2026-06-25T10:30:00Z' },
  { id: '99999999-0002-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', action: 'inspection_submitted',     entity_type: 'inspection', entity_id: 'dddddddd-0000-0000-0000-000000000003', metadata: { result: 'fail' }, created_at: '2026-06-26T09:00:00Z' },
  { id: '99999999-0003-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', action: 'defect_logged',            entity_type: 'defect',     entity_id: 'eeeeeeee-0001-0000-0000-000000000000', metadata: { severity: 'medium' }, created_at: '2026-06-26T09:30:00Z' },
  { id: '99999999-0004-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', action: 'defect_logged',            entity_type: 'defect',     entity_id: 'eeeeeeee-0002-0000-0000-000000000000', metadata: { severity: 'critical' }, created_at: '2026-06-26T14:15:00Z' },
  { id: '99999999-0005-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', action: 'defect_approved',          entity_type: 'defect',     entity_id: 'eeeeeeee-0005-0000-0000-000000000000', metadata: null, created_at: '2026-06-20T11:05:00Z' },
  { id: '99999999-0006-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', action: 'defect_approved',          entity_type: 'defect',     entity_id: 'eeeeeeee-0006-0000-0000-000000000000', metadata: null, created_at: '2026-06-22T13:35:00Z' },
  { id: '99999999-0007-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', action: 'defect_rejected',          entity_type: 'defect',     entity_id: 'eeeeeeee-0007-0000-0000-000000000000', metadata: { comment: 'Re-inspect after maintenance cycle.' }, created_at: '2026-06-19T08:00:00Z' },
  { id: '99999999-0008-0000-0000-000000000000', user_id: '55555555-5555-5555-5555-555555555555', action: 'work_order_status_changed',entity_type: 'work_order', entity_id: 'ffffffff-0005-0000-0000-000000000000', metadata: { from: 'in_progress', to: 'completed' }, created_at: '2026-06-25T16:00:00Z' },
  { id: '99999999-0009-0000-0000-000000000000', user_id: '55555555-5555-5555-5555-555555555555', action: 'work_order_assigned',      entity_type: 'work_order', entity_id: 'ffffffff-0003-0000-0000-000000000000', metadata: null, created_at: '2026-06-27T08:30:00Z' },
  { id: '99999999-0010-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', action: 'inspection_logged',        entity_type: 'inspection', entity_id: 'dddddddd-0000-0000-0000-000000000007', metadata: null, created_at: '2026-07-03T07:00:00Z' },
];

/* ============================================================
   Week 2 — checklist templates and asset types.

   The seed so far is enough to demo list pages; for the inspection
   dynamic-checklist form (DMDD §5) we need:
     - one ChecklistTemplate per AssetType
     - one or more ChecklistTemplateItems per template
   Templates are intentionally small (4–6 items each) — enough to
   make the form look real without becoming the demo's content.
   ============================================================ */

export interface AssetTypeRecord {
  id: string;
  name: string;
}

export interface ChecklistTemplateRecord {
  id: string;
  asset_type_id: string;
  name: string;
}

export interface ChecklistTemplateItemRecord {
  id: string;
  checklist_template_id: string;
  label: string;
  order_index: number;
  requires_photo: boolean;
}

const assetTypes: AssetTypeRecord[] = [
  { id: 'bbbbbbbb-0000-0000-0000-000000000001', name: 'Hydraulic Press' },
  { id: 'bbbbbbbb-0000-0000-0000-000000000002', name: 'Conveyor Motor'  },
  { id: 'bbbbbbbb-0000-0000-0000-000000000003', name: 'Air Compressor'  },
  { id: 'bbbbbbbb-0000-0000-0000-000000000004', name: 'Boiler'          },
  { id: 'bbbbbbbb-0000-0000-0000-000000000005', name: 'CNC Machine'     },
];

export const seedAssetTypes: AssetTypeRecord[] = assetTypes;

export const seedChecklistTemplates: ChecklistTemplateRecord[] = [
  { id: 'ttttttt1-0000-0000-0000-000000000001', asset_type_id: 'bbbbbbbb-0000-0000-0000-000000000001', name: 'Hydraulic Press — Daily Inspection' },
  { id: 'ttttttt1-0000-0000-0000-000000000002', asset_type_id: 'bbbbbbbb-0000-0000-0000-000000000002', name: 'Conveyor Motor — Daily Inspection'  },
  { id: 'ttttttt1-0000-0000-0000-000000000003', asset_type_id: 'bbbbbbbb-0000-0000-0000-000000000003', name: 'Air Compressor — Daily Inspection'  },
  { id: 'ttttttt1-0000-0000-0000-000000000004', asset_type_id: 'bbbbbbbb-0000-0000-0000-000000000004', name: 'Boiler — Daily Inspection'          },
  { id: 'ttttttt1-0000-0000-0000-000000000005', asset_type_id: 'bbbbbbbb-0000-0000-0000-000000000005', name: 'CNC Machine — Daily Inspection'     },
];

export const seedChecklistTemplateItems: ChecklistTemplateItemRecord[] = [
  // Hydraulic Press
  { id: 'cl-hp-1', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000001', label: 'Check hydraulic fluid level',                order_index: 1, requires_photo: false },
  { id: 'cl-hp-2', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000001', label: 'Inspect cylinder seals for leaks',           order_index: 2, requires_photo: true  },
  { id: 'cl-hp-3', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000001', label: 'Verify pressure gauge within tolerance',     order_index: 3, requires_photo: false },
  { id: 'cl-hp-4', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000001', label: 'Test emergency stop button',                 order_index: 4, requires_photo: false },
  { id: 'cl-hp-5', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000001', label: 'Lubricate guide rails',                      order_index: 5, requires_photo: false },
  // Conveyor Motor
  { id: 'cl-cm-1', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000002', label: 'Check belt tension',                          order_index: 1, requires_photo: false },
  { id: 'cl-cm-2', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000002', label: 'Inspect belt for fraying or damage',         order_index: 2, requires_photo: true  },
  { id: 'cl-cm-3', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000002', label: 'Listen for abnormal motor noise',             order_index: 3, requires_photo: false },
  { id: 'cl-cm-4', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000002', label: 'Check motor temperature',                     order_index: 4, requires_photo: false },
  { id: 'cl-cm-5', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000002', label: 'Verify alignment of drive and idler pulleys', order_index: 5, requires_photo: true  },
  // Air Compressor
  { id: 'cl-ac-1', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000003', label: 'Check oil level',                             order_index: 1, requires_photo: false },
  { id: 'cl-ac-2', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000003', label: 'Inspect air filter condition',                order_index: 2, requires_photo: true  },
  { id: 'cl-ac-3', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000003', label: 'Drain moisture from receiver tank',           order_index: 3, requires_photo: false },
  { id: 'cl-ac-4', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000003', label: 'Verify safety valve operation',               order_index: 4, requires_photo: false },
  // Boiler
  { id: 'cl-bo-1', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000004', label: 'Check water level gauge',                      order_index: 1, requires_photo: false },
  { id: 'cl-bo-2', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000004', label: 'Inspect pressure relief valve',                order_index: 2, requires_photo: true  },
  { id: 'cl-bo-3', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000004', label: 'Verify flame pattern is stable',               order_index: 3, requires_photo: false },
  { id: 'cl-bo-4', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000004', label: 'Check combustion air damper operation',        order_index: 4, requires_photo: false },
  { id: 'cl-bo-5', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000004', label: 'Test low-water cutoff',                        order_index: 5, requires_photo: false },
  // CNC Machine
  { id: 'cl-cn-1', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000005', label: 'Check spindle for abnormal vibration',         order_index: 1, requires_photo: false },
  { id: 'cl-cn-2', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000005', label: 'Verify tool magazine indexing',                 order_index: 2, requires_photo: true  },
  { id: 'cl-cn-3', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000005', label: 'Inspect way covers and wipers',                 order_index: 3, requires_photo: false },
  { id: 'cl-cn-4', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000005', label: 'Check coolant level and concentration',         order_index: 4, requires_photo: false },
  { id: 'cl-cn-5', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000005', label: 'Verify axis lubrication pressure',              order_index: 5, requires_photo: false },
  { id: 'cl-cn-6', checklist_template_id: 'ttttttt1-0000-0000-0000-000000000005', label: 'Test emergency stop circuit',                    order_index: 6, requires_photo: false },
];

/**
 * Mutable in-memory lists for data created at runtime (inspections, defects,
 * work orders, audit logs, notifications). Initialised as empty arrays —
 * seed data above is read-only and serves as the "starting state" for
 * read endpoints, while write endpoints append to these lists so newly
 * created records survive for the life of the server process.
 */
export const runtimeInspections: Inspection[] = [];
export const runtimeDefects: Defect[] = [];
export const runtimeWorkOrders: WorkOrder[] = [];
export const runtimeAuditLogs: AuditLog[] = [];
export const runtimeNotifications: Notification[] = [];
export const runtimeReports: GeneratedReport[] = [];

/**
 * Push `notification` to runtimeNotifications only if the target user
 * has not opted out of email notifications. Silent no-op when opted out.
 *
 * Used by every controller that creates notifications (defects,
 * inspections, work-orders) so the Settings > Email Notifications
 * toggle has real effect.
 */
export function notifyUser(userId: string, notification: Notification): void {
  const user = seedUsers.find((u) => u.id === userId);
  if (user?.preferences?.email_notifications === false) return;
  runtimeNotifications.push(notification);
}

/**
 * Effective "all X" list for read endpoints — concatenates the immutable
 * seed with whatever was created at runtime. Order: runtime first (newest
 * in the typical user flow), then seed.
 */
export function allInspections(): Inspection[] {
  return [...runtimeInspections, ...seedInspections];
}
export function allDefects(): Defect[] {
  return [...runtimeDefects, ...seedDefects];
}
export function allWorkOrders(): WorkOrder[] {
  return [...runtimeWorkOrders, ...seedWorkOrders];
}
export function allAuditLogs(): AuditLog[] {
  return [...runtimeAuditLogs, ...seedAuditLogs];
}
export function allNotifications(): Notification[] {
  return [...runtimeNotifications, ...seedNotifications];
}

export const seedNotifications: Notification[] = [
  { id: '77777777-0001-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', type: 'defect_critical',      message: 'Critical defect awaiting approval: Hydraulic fluid leak (CHK-HP-001)', entity_type: 'defect', entity_id: 'eeeeeeee-0003-0000-0000-000000000000', read: false, created_at: '2026-06-28T08:05:00Z' },
  { id: '77777777-0002-0000-0000-000000000000', user_id: '33333333-3333-3333-3333-333333333333', type: 'defect_critical',      message: 'Critical defect awaiting approval: Overheating on motor windings (CHK-CM-001)', entity_type: 'defect', entity_id: 'eeeeeeee-0004-0000-0000-000000000000', read: false, created_at: '2026-06-30T10:50:00Z' },
  { id: '77777777-0003-0000-0000-000000000000', user_id: '55555555-5555-5555-5555-555555555555', type: 'work_order_assigned',  message: 'New work order assigned: Conveyor belt repair (PUN-CM-001)',           entity_type: 'work_order', entity_id: 'ffffffff-0003-0000-0000-000000000000', read: false, created_at: '2026-06-27T08:30:00Z' },
  { id: '77777777-0004-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', type: 'inspection_overdue',   message: 'Inspection overdue: Hydraulic Press B2 (CHK-HP-002)',                  entity_type: 'inspection', entity_id: 'dddddddd-0000-0000-0000-000000000007', read: true,  created_at: '2026-07-04T07:00:00Z' },
  { id: '77777777-0005-0000-0000-000000000000', user_id: '22222222-2222-2222-2222-222222222222', type: 'defect_critical',      message: 'Critical defect awaiting approval: Pressure relief valve (PUN-BO-001)', entity_type: 'defect', entity_id: 'eeeeeeee-0002-0000-0000-000000000000', read: false, created_at: '2026-06-26T14:20:00Z' },
  { id: '77777777-0006-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', type: 'defect_created',       message: 'Defect logged (medium): Bearing noise on Conveyor Belt drive',        entity_type: 'defect', entity_id: 'eeeeeeee-0001-0000-0000-000000000000', read: false, created_at: '2026-07-10T09:15:00Z' },
  { id: '77777777-0007-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', type: 'defect_approved',      message: 'Your defect report has been approved. A work order has been created.', entity_type: 'defect', entity_id: 'eeeeeeee-0004-0000-0000-000000000000', read: false, created_at: '2026-07-02T14:30:00Z' },
  // BWF §14 full coverage — inspection_assigned and inspection_due
  { id: '77777777-0008-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', type: 'inspection_assigned', message: 'New inspection assigned: Hydraulic Press A1 (PUN-HP-001) — due 2026-07-08', entity_type: 'inspection', entity_id: 'dddddddd-0000-0000-0000-000000000005', read: false, created_at: '2026-07-07T08:00:00Z' },
  { id: '77777777-0009-0000-0000-000000000000', user_id: '44444444-4444-4444-4444-444444444444', type: 'inspection_due',       message: 'Inspection due today: Air Compressor C-2 (PUN-AC-002)',                 entity_type: 'inspection', entity_id: 'dddddddd-0000-0000-0000-000000000006', read: false, created_at: '2026-07-09T06:00:00Z' },
];
