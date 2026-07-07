-- ============================================================================
-- EAOP — Seed Data
-- Implements reference/08-Data-Model-Database-Design.md §15
-- Idempotent: safe to re-run (uses fixed UUIDs + ON CONFLICT DO NOTHING).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Plants (3)
-- ----------------------------------------------------------------------------
INSERT INTO plants (id, name, city, address, status) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001', 'Pune Plant',   'Pune',   'Plot 4, MIDC Phase II, Pune',     'active'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'Chakan Plant', 'Chakan', 'Plot 22, Chakan Industrial Area',  'active'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'Nashik Plant', 'Nashik', 'Plot 9, Sinnar MIDC, Nashik',      'active')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Asset types (5)
-- ----------------------------------------------------------------------------
INSERT INTO asset_types (id, name) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Hydraulic Press'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Conveyor Motor'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Air Compressor'),
  ('bbbbbbbb-0000-0000-0000-000000000004', 'Boiler'),
  ('bbbbbbbb-0000-0000-0000-000000000005', 'CNC Machine')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Users (5 — one per role, all password "password123")
-- password_hash pre-generated for bcrypt cost 10 of "password123"
-- ----------------------------------------------------------------------------
INSERT INTO users (id, full_name, email, password_hash, role, plant_id, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'System Administrator', 'admin@eaop.local',
     '$2a$10$Dow1b9p7KOd9iyy6Xd5H5u3kN2sG6xqf.L3M1YyV.6S6n0d9H5Tbm', 'admin',          NULL,                                                  'active'),
  ('22222222-2222-2222-2222-222222222222', 'Priya Deshpande',     'plant.manager@eaop.local',
     '$2a$10$Dow1b9p7KOd9iyy6Xd5H5u3kN2sG6xqf.L3M1YyV.6S6n0d9H5Tbm', 'plant_manager',   'aaaaaaaa-0000-0000-0000-000000000001',             'active'),
  ('33333333-3333-3333-3333-333333333333', 'Rajesh Kulkarni',     'supervisor@eaop.local',
     '$2a$10$Dow1b9p7KOd9iyy6Xd5H5u3kN2sG6xqf.L3M1YyV.6S6n0d9H5Tbm', 'supervisor',      'aaaaaaaa-0000-0000-0000-000000000001',             'active'),
  ('44444444-4444-4444-4444-444444444444', 'Anita Joshi',         'inspector@eaop.local',
     '$2a$10$Dow1b9p7KOd9iyy6Xd5H5u3kN2sG6xqf.L3M1YyV.6S6n0d9H5Tbm', 'inspector',       'aaaaaaaa-0000-0000-0000-000000000001',             'active'),
  ('55555555-5555-5555-5555-555555555555', 'Vikram Patil',        'technician@eaop.local',
     '$2a$10$Dow1b9p7KOd9iyy6Xd5H5u3kN2sG6xqf.L3M1YyV.6S6n0d9H5Tbm', 'technician',      'aaaaaaaa-0000-0000-0000-000000000001',             'active')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Checklist templates (one per asset type) + 6 items each, ≥1 requires_photo
-- ----------------------------------------------------------------------------
INSERT INTO checklist_templates (id, asset_type_id) VALUES
  ('cccccccc-0001-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000001'),
  ('cccccccc-0002-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000002'),
  ('cccccccc-0003-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000003'),
  ('cccccccc-0004-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000004'),
  ('cccccccc-0005-0000-0000-000000000000', 'bbbbbbbb-0000-0000-0000-000000000005')
ON CONFLICT (id) DO NOTHING;

-- Hydraulic Press checklist
INSERT INTO checklist_template_items (id, checklist_template_id, label, order_index, requires_photo) VALUES
  ('dddddddd-1001-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000000', 'Check hydraulic fluid level',         1, FALSE),
  ('dddddddd-1001-0000-0000-000000000002', 'cccccccc-0001-0000-0000-000000000000', 'Inspect hoses for visible leaks',     2, TRUE),
  ('dddddddd-1001-0000-0000-000000000003', 'cccccccc-0001-0000-0000-000000000000', 'Test pressure relief valve',          3, FALSE),
  ('dddddddd-1001-0000-0000-000000000000', 'cccccccc-0001-0000-0000-000000000000', 'Verify die alignment',                4, FALSE),
  ('dddddddd-1001-0000-0000-000000000004', 'cccccccc-0001-0000-0000-000000000000', 'Listen for abnormal sounds',          5, FALSE),
  ('dddddddd-1001-0000-0000-000000000005', 'cccccccc-0001-0000-0000-000000000000', 'Check emergency stop functionality',  6, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Conveyor Motor checklist
INSERT INTO checklist_template_items (id, checklist_template_id, label, order_index, requires_photo) VALUES
  ('dddddddd-1002-0000-0000-000000000001', 'cccccccc-0002-0000-0000-000000000000', 'Check belt tension',         1, FALSE),
  ('dddddddd-1002-0000-0000-000000000002', 'cccccccc-0002-0000-0000-000000000000', 'Inspect belt for fraying',   2, TRUE),
  ('dddddddd-1002-0000-0000-000000000003', 'cccccccc-0002-0000-0000-000000000000', 'Measure motor temperature',  3, FALSE),
  ('dddddddd-1002-0000-0000-000000000000', 'cccccccc-0002-0000-0000-000000000000', 'Check lubrication points',   4, FALSE),
  ('dddddddd-1002-0000-0000-000000000004', 'cccccccc-0002-0000-0000-000000000000', 'Verify safety guards',       5, FALSE),
  ('dddddddd-1002-0000-0000-000000000005', 'cccccccc-0002-0000-0000-000000000000', 'Test emergency stop',        6, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Air Compressor checklist
INSERT INTO checklist_template_items (id, checklist_template_id, label, order_index, requires_photo) VALUES
  ('dddddddd-1003-0000-0000-000000000001', 'cccccccc-0003-0000-0000-000000000000', 'Check air filter',                1, TRUE),
  ('dddddddd-1003-0000-0000-000000000002', 'cccccccc-0003-0000-0000-000000000000', 'Inspect oil level',               2, FALSE),
  ('dddddddd-1003-0000-0000-000000000000', 'cccccccc-0003-0000-0000-000000000000', 'Drain moisture from tank',        3, FALSE),
  ('dddddddd-1003-0000-0000-000000000003', 'cccccccc-0003-0000-0000-000000000000', 'Test pressure gauge accuracy',    4, FALSE),
  ('dddddddd-1003-0000-0000-000000000004', 'cccccccc-0003-0000-0000-000000000000', 'Check belt tension and condition', 5, FALSE),
  ('dddddddd-1003-0000-0000-000000000005', 'cccccccc-0003-0000-0000-000000000000', 'Listen for leaks',                6, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Boiler checklist
INSERT INTO checklist_template_items (id, checklist_template_id, label, order_index, requires_photo) VALUES
  ('dddddddd-1004-0000-0000-000000000001', 'cccccccc-0004-0000-0000-000000000000', 'Inspect pressure relief valve',  1, TRUE),
  ('dddddddd-1004-0000-0000-000000000000', 'cccccccc-0004-0000-0000-000000000000', 'Check water level',              2, FALSE),
  ('dddddddd-1004-0000-0000-000000000002', 'cccccccc-0004-0000-0000-000000000000', 'Test low-water cutoff',          3, FALSE),
  ('dddddddd-1004-0000-0000-000000000003', 'cccccccc-0004-0000-0000-000000000000', 'Verify gas pressure regulator',   4, FALSE),
  ('dddddddd-1004-0000-0000-000000000004', 'cccccccc-0004-0000-0000-000000000000', 'Check flue/exhaust',             5, FALSE),
  ('dddddddd-1004-0000-0000-000000000005', 'cccccccc-0004-0000-0000-000000000000', 'Inspect for corrosion',          6, TRUE)
ON CONFLICT (id) DO NOTHING;

-- CNC Machine checklist
INSERT INTO checklist_template_items (id, checklist_template_id, label, order_index, requires_photo) VALUES
  ('dddddddd-1005-0000-0000-000000000001', 'cccccccc-0005-0000-0000-000000000000', 'Check spindle condition',     1, FALSE),
  ('dddddddd-1005-0000-0000-000000000002', 'cccccccc-0005-0000-0000-000000000000', 'Verify tool alignment',       2, FALSE),
  ('dddddddd-1005-0000-0000-000000000000', 'cccccccc-0005-0000-0000-000000000000', 'Inspect coolant level',       3, FALSE),
  ('dddddddd-1005-0000-0000-000000000003', 'cccccccc-0005-0000-0000-000000000000', 'Check axis lubrication',      4, FALSE),
  ('dddddddd-1005-0000-0000-000000000004', 'cccccccc-0005-0000-0000-000000000000', 'Test emergency stop',         5, FALSE),
  ('dddddddd-1005-0000-0000-000000000005', 'cccccccc-0005-0000-0000-000000000000', 'Verify enclosure interlocks',  6, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Assets (20 across 3 plants, 5 types — see doc 08 §15)
-- ----------------------------------------------------------------------------
INSERT INTO assets (id, asset_code, name, asset_type_id, plant_id, department, status) VALUES
  -- Pune
  ('cccccccc-0001-0000-0000-000000000001', 'PUN-HP-001', 'Hydraulic Press A1',  'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Body Shop',  'active'),
  ('cccccccc-0001-0000-0000-000000000002', 'PUN-HP-002', 'Hydraulic Press A2',  'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000001', 'Body Shop',  'active'),
  ('cccccccc-0001-0000-0000-000000000003', 'PUN-CM-001', 'Conveyor Motor M-12', 'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Assembly',   'active'),
  ('cccccccc-0001-0000-0000-000000000004', 'PUN-CM-002', 'Conveyor Motor M-13', 'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001', 'Assembly',   'active'),
  ('cccccccc-0001-0000-0000-000000000005', 'PUN-AC-001', 'Air Compressor C-1',  'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Utilities',  'active'),
  ('cccccccc-0001-0000-0000-000000000006', 'PUN-AC-002', 'Air Compressor C-2',  'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000001', 'Utilities',  'active'),
  ('cccccccc-0001-0000-0000-000000000007', 'PUN-BO-001', 'Steam Boiler B-1',    'bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000001', 'Utilities',  'under_maintenance'),
  ('cccccccc-0001-0000-0000-000000000008', 'PUN-CN-001', 'CNC Lathe L-1',       'bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000001', 'Machining',  'active'),
  -- Chakan
  ('cccccccc-0001-0000-0000-000000000009', 'CHK-HP-001', 'Hydraulic Press B1',  'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Stamping',   'active'),
  ('cccccccc-0001-0000-0000-000000000010', 'CHK-HP-002', 'Hydraulic Press B2',  'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002', 'Stamping',   'active'),
  ('cccccccc-0001-0000-0000-000000000011', 'CHK-CM-001', 'Conveyor Motor M-21', 'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'Paint Shop', 'active'),
  ('cccccccc-0001-0000-0000-000000000012', 'CHK-CM-002', 'Conveyor Motor M-22', 'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000002', 'Paint Shop', 'active'),
  ('cccccccc-0001-0000-0000-000000000013', 'CHK-AC-001', 'Air Compressor C-3',  'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000002', 'Utilities',  'active'),
  ('cccccccc-0001-0000-0000-000000000014', 'CHK-CN-001', 'CNC Mill M-1',        'bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'Machining',  'active'),
  ('cccccccc-0001-0000-0000-000000000015', 'CHK-CN-002', 'CNC Mill M-2',        'bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000002', 'Machining',  'active'),
  -- Nashik
  ('cccccccc-0001-0000-0000-000000000016', 'NSK-HP-001', 'Hydraulic Press C1',  'bbbbbbbb-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000003', 'Forging',    'active'),
  ('cccccccc-0001-0000-0000-000000000017', 'NSK-CM-001', 'Conveyor Motor M-31', 'bbbbbbbb-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000003', 'Assembly',   'active'),
  ('cccccccc-0001-0000-0000-000000000018', 'NSK-AC-001', 'Air Compressor C-4',  'bbbbbbbb-0000-0000-0000-000000000003', 'aaaaaaaa-0000-0000-0000-000000000003', 'Utilities',  'active'),
  ('cccccccc-0001-0000-0000-000000000019', 'NSK-BO-001', 'Steam Boiler B-2',    'bbbbbbbb-0000-0000-0000-000000000004', 'aaaaaaaa-0000-0000-0000-000000000003', 'Utilities',  'active'),
  ('cccccccc-0001-0000-0000-000000000020', 'NSK-CN-001', 'CNC Lathe L-2',       'bbbbbbbb-0000-0000-0000-000000000005', 'aaaaaaaa-0000-0000-0000-000000000003', 'Machining',  'active')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Inspections (mix of pass, fail, pending, overdue)
-- ----------------------------------------------------------------------------
INSERT INTO inspections (id, asset_id, inspector_id, scheduled_date, completed_at, overall_result) VALUES
  ('dddddddd-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', '2026-06-25', '2026-06-25T10:30:00Z', 'pass'),
  ('dddddddd-0000-0000-0000-000000000002', 'cccccccc-0001-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', '2026-06-25', '2026-06-25T11:15:00Z', 'pass'),
  ('dddddddd-0000-0000-0000-000000000003', 'cccccccc-0001-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', '2026-06-26', '2026-06-26T09:00:00Z', 'fail'),
  ('dddddddd-0000-0000-0000-000000000004', 'cccccccc-0001-0000-0000-000000000007', '44444444-4444-4444-4444-444444444444', '2026-06-26', '2026-06-26T14:00:00Z', 'fail'),
  ('dddddddd-0000-0000-0000-000000000005', 'cccccccc-0001-0000-0000-000000000005', '44444444-4444-4444-4444-444444444444', '2026-07-08', NULL,                   'pending'),
  ('dddddddd-0000-0000-0000-000000000006', 'cccccccc-0001-0000-0000-000000000006', '44444444-4444-4444-4444-444444444444', '2026-07-09', NULL,                   'pending'),
  ('dddddddd-0000-0000-0000-000000000007', 'cccccccc-0001-0000-0000-000000000010', '44444444-4444-4444-4444-444444444444', '2026-07-03', NULL,                   'pending')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Defects (all 4 severities, all 6 statuses — including 3 Critical pending_approval)
-- ----------------------------------------------------------------------------
INSERT INTO defects (id, asset_id, inspection_id, reported_by, severity, category, description, photo_urls, status, created_at) VALUES
  ('eeeeeeee-0000-0000-0000-000000000001', 'cccccccc-0001-0000-0000-000000000003', 'dddddddd-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'medium',   'Mechanical', 'Conveyor belt showing visible fraying on the drive side.',                   '{}', 'open',                 '2026-06-26T09:30:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000002', 'cccccccc-0001-0000-0000-000000000007', 'dddddddd-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'critical', 'Safety',     'Pressure relief valve reading outside tolerance — immediate attention required.', '{}', 'pending_approval',    '2026-06-26T14:15:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000003', 'cccccccc-0001-0000-0000-000000000009', NULL,                                         '44444444-4444-4444-4444-444444444444', 'critical', 'Hydraulic',  'Hydraulic fluid leak detected at the main cylinder seal.',                  '{}', 'pending_approval',    '2026-06-28T08:00:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000004', 'cccccccc-0001-0000-0000-000000000011', NULL,                                         '44444444-4444-4444-4444-444444444444', 'critical', 'Electrical', 'Overheating noted on motor windings during operation.',                     '{}', 'pending_approval',    '2026-06-30T10:45:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000005', 'cccccccc-0001-0000-0000-000000000005', NULL,                                         '44444444-4444-4444-4444-444444444444', 'low',      'Consumable', 'Air filter due for replacement (service interval reached).',               '{}', 'work_order_created',  '2026-06-20T11:00:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000006', 'cccccccc-0001-0000-0000-000000000001', NULL,                                         '44444444-4444-4444-4444-444444444444', 'high',     'Mechanical', 'Press die alignment drift detected, requires calibration.',                '{}', 'work_order_created',  '2026-06-22T13:30:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000007', 'cccccccc-0001-0000-0000-000000000014', NULL,                                         '44444444-4444-4444-4444-444444444444', 'medium',   'Tooling',    'Spindle vibration above acceptable limit.',                                '{}', 'rejected',            '2026-06-18T16:20:00Z'),
  ('eeeeeeee-0000-0000-0000-000000000008', 'cccccccc-0001-0000-0000-000000000004', NULL,                                         '44444444-4444-4444-4444-444444444444', 'low',      'Lubrication', 'Bearing lubrication overdue per maintenance schedule.',                   '{}', 'resolved',            '2026-06-10T09:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Approvals (one for each pre-approved/non-critical work-order-bearing defect)
-- ----------------------------------------------------------------------------
INSERT INTO approvals (id, defect_id, approver_id, decision, comment, decided_at) VALUES
  ('99999999-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'approved', NULL,        '2026-06-20T11:05:00Z'),
  ('99999999-0000-0000-0000-000000000006', 'eeeeeeee-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'approved', NULL,        '2026-06-22T13:35:00Z'),
  ('99999999-0000-0000-0000-000000000007', 'eeeeeeee-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', 'rejected', 'Re-inspect after maintenance cycle.', '2026-06-19T08:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Work orders (one per defect, in all 4 Kanban columns)
-- ----------------------------------------------------------------------------
INSERT INTO work_orders (id, defect_id, assigned_to, priority, status, deadline, created_at) VALUES
  ('ffffffff-0000-0000-0000-000000000001', 'eeeeeeee-0000-0000-0000-000000000005', NULL,                                         'low',     'open',        '2026-07-15', '2026-06-20T11:05:00Z'),
  ('ffffffff-0000-0000-0000-000000000002', 'eeeeeeee-0000-0000-0000-000000000006', NULL,                                         'high',    'open',        '2026-07-12', '2026-06-22T13:35:00Z'),
  ('ffffffff-0000-0000-0000-000000000003', 'eeeeeeee-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 'medium',  'assigned',    '2026-07-10', '2026-06-26T10:00:00Z'),
  ('ffffffff-0000-0000-0000-000000000004', 'eeeeeeee-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555555', 'low',     'in_progress', '2026-07-05', '2026-06-10T09:30:00Z'),
  ('ffffffff-0000-0000-0000-000000000005', 'eeeeeeee-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555555', 'low',     'completed',   '2026-06-25', '2026-06-10T10:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Audit logs (10 entries spread across users and entity types)
-- ----------------------------------------------------------------------------
INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, metadata, created_at) VALUES
  ('99999999-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 'inspection_submitted',     'inspection', 'dddddddd-0000-0000-0000-000000000001', '{"result":"pass"}'::jsonb,                          '2026-06-25T10:30:00Z'),
  ('99999999-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'inspection_submitted',     'inspection', 'dddddddd-0000-0000-0000-000000000003', '{"result":"fail"}'::jsonb,                          '2026-06-26T09:00:00Z'),
  ('99999999-0000-0000-0000-000000000003', '44444444-4444-4444-4444-444444444444', 'defect_logged',            'defect',     'eeeeeeee-0000-0000-0000-000000000001', '{"severity":"medium"}'::jsonb,                      '2026-06-26T09:30:00Z'),
  ('99999999-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'defect_logged',            'defect',     'eeeeeeee-0000-0000-0000-000000000002', '{"severity":"critical"}'::jsonb,                    '2026-06-26T14:15:00Z'),
  ('99999999-0000-0000-0000-000000000005', '33333333-3333-3333-3333-333333333333', 'defect_approved',          'defect',     'eeeeeeee-0000-0000-0000-000000000005', NULL,                                                   '2026-06-20T11:05:00Z'),
  ('99999999-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'defect_approved',          'defect',     'eeeeeeee-0000-0000-0000-000000000006', NULL,                                                   '2026-06-22T13:35:00Z'),
  ('99999999-0000-0000-0000-000000000007', '33333333-3333-3333-3333-333333333333', 'defect_rejected',          'defect',     'eeeeeeee-0000-0000-0000-000000000007', '{"comment":"Re-inspect after maintenance cycle."}'::jsonb, '2026-06-19T08:00:00Z'),
  ('99999999-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555555', 'work_order_status_changed','work_order', 'ffffffff-0000-0000-0000-000000000005', '{"from":"in_progress","to":"completed"}'::jsonb,   '2026-06-25T16:00:00Z'),
  ('99999999-0000-0000-0000-000000000009', '55555555-5555-5555-5555-555555555555', 'work_order_assigned',      'work_order', 'ffffffff-0000-0000-0000-000000000003', NULL,                                                   '2026-06-27T08:30:00Z'),
  ('99999999-0000-0000-0000-000000000010', '44444444-4444-4444-4444-444444444444', 'inspection_logged',        'inspection', 'dddddddd-0000-0000-0000-000000000007', NULL,                                                   '2026-07-03T07:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, type, message, entity_type, entity_id, read, created_at) VALUES
  ('77777777-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'defect_critical',     'Critical defect awaiting approval: Hydraulic fluid leak (CHK-HP-001)',         'defect',     'eeeeeeee-0000-0000-0000-000000000003', FALSE, '2026-06-28T08:05:00Z'),
  ('77777777-0000-0000-0000-000000000002', '33333333-3333-3333-3333-333333333333', 'defect_critical',     'Critical defect awaiting approval: Overheating on motor windings (CHK-CM-001)', 'defect',     'eeeeeeee-0000-0000-0000-000000000004', FALSE, '2026-06-30T10:50:00Z'),
  ('77777777-0000-0000-0000-000000000003', '55555555-5555-5555-5555-555555555555', 'work_order_assigned', 'New work order assigned: Conveyor belt repair (PUN-CM-001)',                   'work_order', 'ffffffff-0000-0000-0000-000000000003', FALSE, '2026-06-27T08:30:00Z'),
  ('77777777-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'inspection_overdue',  'Inspection overdue: Hydraulic Press B2 (CHK-HP-002)',                          'inspection', 'dddddddd-0000-0000-0000-000000000007', TRUE,  '2026-07-04T07:00:00Z'),
  ('77777777-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 'defect_critical',     'Critical defect awaiting approval: Pressure relief valve (PUN-BO-001)',       'defect',     'eeeeeeee-0000-0000-0000-000000000002', FALSE, '2026-06-26T14:20:00Z')
ON CONFLICT (id) DO NOTHING;

COMMIT;
