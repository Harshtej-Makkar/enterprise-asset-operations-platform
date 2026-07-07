-- ============================================================================
-- EAOP — Initial Database Schema
-- Implements reference/08-Data-Model-Database-Design.md
-- 15 core tables (corrected per doc 08 §3). Roles are an enum, not a table.
-- ============================================================================

-- pgcrypto gives us gen_random_uuid(); on older PG (<13) you'd need uuid-ossp.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Reference tables
-- ----------------------------------------------------------------------------
CREATE TABLE plants (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(120) NOT NULL,
  city       VARCHAR(80)  NOT NULL,
  address    TEXT,
  status     VARCHAR(16)  NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE asset_types (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(80) NOT NULL UNIQUE
);

-- ----------------------------------------------------------------------------
-- Users — role is an enum-like VARCHAR constrained via CHECK
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,                    -- bcrypt (DMDD §11)
  role          VARCHAR(32)  NOT NULL
                  CHECK (role IN ('admin', 'plant_manager', 'supervisor', 'inspector', 'technician')),
  plant_id      UUID         REFERENCES plants(id) ON DELETE SET NULL,
  status        VARCHAR(16)  NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email  ON users(email);
CREATE INDEX idx_users_plant  ON users(plant_id);

-- ----------------------------------------------------------------------------
-- Assets
-- ----------------------------------------------------------------------------
CREATE TABLE assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code    VARCHAR(64)  NOT NULL UNIQUE,             -- e.g. PUN-HP-001
  name          VARCHAR(160) NOT NULL,
  asset_type_id UUID         NOT NULL REFERENCES asset_types(id),
  plant_id      UUID         NOT NULL REFERENCES plants(id),
  department    VARCHAR(80),
  status        VARCHAR(24)  NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'under_maintenance', 'retired')),
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_assets_code     ON assets(asset_code);
CREATE INDEX idx_assets_plant    ON assets(plant_id);
CREATE INDEX idx_assets_status   ON assets(status);
CREATE INDEX idx_assets_type     ON assets(asset_type_id);

-- ----------------------------------------------------------------------------
-- Checklist templates (one per asset type, dynamic per-inspection form)
-- ----------------------------------------------------------------------------
CREATE TABLE checklist_templates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_type_id UUID NOT NULL UNIQUE REFERENCES asset_types(id) ON DELETE CASCADE
);

CREATE TABLE checklist_template_items (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  checklist_template_id UUID NOT NULL REFERENCES checklist_templates(id) ON DELETE CASCADE,
  label                 VARCHAR(255) NOT NULL,
  order_index           INTEGER      NOT NULL,
  requires_photo        BOOLEAN      NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_checklist_items_template ON checklist_template_items(checklist_template_id, order_index);

-- ----------------------------------------------------------------------------
-- Inspections
-- ----------------------------------------------------------------------------
CREATE TABLE inspections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID         NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  inspector_id    UUID         NOT NULL REFERENCES users(id),
  scheduled_date  DATE         NOT NULL,
  completed_at    TIMESTAMPTZ,
  overall_result  VARCHAR(16)  NOT NULL DEFAULT 'pending'
                    CHECK (overall_result IN ('pass', 'fail', 'pending')),
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inspections_asset     ON inspections(asset_id);
CREATE INDEX idx_inspections_inspector ON inspections(inspector_id);
CREATE INDEX idx_inspections_result    ON inspections(overall_result);
CREATE INDEX idx_inspections_scheduled ON inspections(scheduled_date);

CREATE TABLE inspection_items (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inspection_id               UUID NOT NULL REFERENCES inspections(id) ON DELETE CASCADE,
  checklist_template_item_id  UUID NOT NULL REFERENCES checklist_template_items(id),
  result                      VARCHAR(8) NOT NULL
                                CHECK (result IN ('pass', 'fail', 'na')),
  notes                       TEXT,
  photo_url                   TEXT
);
CREATE INDEX idx_inspection_items_inspection ON inspection_items(inspection_id);

-- ----------------------------------------------------------------------------
-- Defects (with the corrected Approval action baked in)
-- ----------------------------------------------------------------------------
CREATE TABLE defects (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id     UUID         NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  inspection_id UUID         REFERENCES inspections(id) ON DELETE SET NULL,   -- nullable: standalone defects OK
  reported_by  UUID         NOT NULL REFERENCES users(id),
  severity     VARCHAR(16)  NOT NULL
                 CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category     VARCHAR(64)  NOT NULL,
  description  TEXT         NOT NULL,
  photo_urls   TEXT[]       NOT NULL DEFAULT '{}',
  status       VARCHAR(24)  NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'pending_approval', 'approved', 'rejected', 'work_order_created', 'resolved')),
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_defects_asset    ON defects(asset_id);
CREATE INDEX idx_defects_status   ON defects(status);
CREATE INDEX idx_defects_severity ON defects(severity);
CREATE INDEX idx_defects_created  ON defects(created_at DESC);

-- Approvals — one per Critical defect, per DMDD §5
CREATE TABLE approvals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  defect_id   UUID         NOT NULL UNIQUE REFERENCES defects(id) ON DELETE CASCADE,
  approver_id UUID         NOT NULL REFERENCES users(id),
  decision    VARCHAR(16)  NOT NULL CHECK (decision IN ('approved', 'rejected')),
  comment     TEXT,
  decided_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_approvals_defect ON approvals(defect_id);

-- ----------------------------------------------------------------------------
-- Work orders (Kanban)
-- ----------------------------------------------------------------------------
CREATE TABLE work_orders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  defect_id   UUID         NOT NULL UNIQUE REFERENCES defects(id) ON DELETE CASCADE,    -- 1—1 with defect (DMDD §6)
  assigned_to UUID         REFERENCES users(id) ON DELETE SET NULL,
  priority    VARCHAR(16)  NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status      VARCHAR(16)  NOT NULL DEFAULT 'open'
                CHECK (status IN ('open', 'assigned', 'in_progress', 'completed')),
  deadline    DATE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_work_orders_defect   ON work_orders(defect_id);
CREATE INDEX idx_work_orders_status   ON work_orders(status);
CREATE INDEX idx_work_orders_assigned ON work_orders(assigned_to);

CREATE TABLE maintenance_updates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id     UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  technician_id     UUID NOT NULL REFERENCES users(id),
  note              TEXT NOT NULL,
  status_change_to  VARCHAR(16) CHECK (status_change_to IN ('open', 'assigned', 'in_progress', 'completed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_maintenance_updates_wo ON maintenance_updates(work_order_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Audit logs (immutable per DMDD §9)
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id),
  action      VARCHAR(64)  NOT NULL,
  entity_type VARCHAR(32)  NOT NULL,
  entity_id   UUID         NOT NULL,
  metadata    JSONB,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_logs_entity  ON audit_logs(entity_type, entity_id, created_at DESC);
CREATE INDEX idx_audit_logs_user    ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ----------------------------------------------------------------------------
-- Notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(48)  NOT NULL,
  message     TEXT         NOT NULL,
  entity_type VARCHAR(32),
  entity_id   UUID,
  read        BOOLEAN      NOT NULL DEFAULT FALSE,         -- per DMDD §13: `read` is acceptable
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, read, created_at DESC);
