# Enterprise Asset Operations Platform (EAOP)
# Data Model & Database Design Document (DMDD)

---

**Document ID:** EAOP-DMDD-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the logical data model: business entities, relationships, keys, constraints, naming conventions. Source of truth for all persistence-related decisions.

---

# 2. Database Overview

Database: PostgreSQL. Architecture: Relational. Naming: snake_case. Primary Keys: UUID. Timestamps: `created_at`, `updated_at`. Soft Deletes: not used in MVP. Audit Logging: separate `audit_logs` table (core, not future — see correction below).

---

# 3. Core Entities — Corrected

**An earlier draft of this document listed Work Orders, Maintenance Logs, and QR Codes under "Future versions" (§3) and omitted an Approvals table and a core-schema Audit Logs table entirely. This directly contradicted the Business Workflow and Architecture documents, which both treat Work Orders and Approval as core lifecycle steps. Corrected below — these are now core MVP entities.**

```
Users · Roles · Plants · Asset Types · Assets
Checklist Templates · Checklist Template Items
Inspections · Inspection Items
Defects · Approvals
Work Orders · Maintenance Updates
Audit Logs · Notifications
```

Genuinely future (unchanged from prior draft): Vendors, Spare Parts, Equipment Manuals, Predictive Maintenance tables, actual QR scan-event logging (QR *display* only needs an asset code the frontend renders into an image client-side — no dedicated table required).

---

# 4. Entity Relationship Diagram

```
Plant ──< Asset ──< Inspection ──< InspectionItem
                │         │
                │         └──< Defect ──< Approval
                │                   │
                │                   └──< WorkOrder ──< MaintenanceUpdate
                │
User ──< Inspection
User ──< Defect (reported_by)
User ──< Approval (approver)
User ──< WorkOrder (assigned_to)
User ──< Notification
(any entity) ──< AuditLog
```

---

# 5. Entity Definitions

## Users
`id, full_name, email, password_hash, role, plant_id, status, created_at, updated_at`
Belongs to: Role (enum), Plant.

## Roles (enum, not a separate table for MVP simplicity)
`admin, plant_manager, supervisor, inspector, technician`

## Plants
`id, name, city, address, status`
Relationship: one Plant → many Assets.

## Asset Types
`id, name` (e.g., "Hydraulic Press", "Conveyor Motor" — drives which checklist template loads)

## Assets
`id, asset_code (unique), name, asset_type_id, plant_id, department, status, created_at`
Relationship: Asset → many Inspections, many Defects.

## Checklist Templates
`id, asset_type_id` — one template per asset type.

## Checklist Template Items
`id, checklist_template_id, label, order_index, requires_photo`

## Inspections
`id, asset_id, inspector_id, scheduled_date, completed_at, overall_result (pass/fail/pending)`

## Inspection Items
`id, inspection_id, checklist_template_item_id, result (pass/fail/na), notes, photo_url`

## Defects
`id, asset_id, inspection_id (nullable), reported_by, severity (low/medium/high/critical), category, description, photo_urls (array), status, created_at`
Status values: `open, pending_approval, approved, rejected, work_order_created, resolved`

## Approvals — *Corrected: promoted from absent to core*
`id, defect_id, approver_id, decision (approved/rejected), comment, decided_at`
Only created for Critical-severity defects, per the business rule in the Workflow document.

## Work Orders — *Corrected: promoted from "future" to core*
`id, defect_id, assigned_to (nullable), priority (low/medium/high/urgent), status (open/assigned/in_progress/completed), deadline (nullable), created_at`
Every work order references exactly one defect.

## Maintenance Updates
`id, work_order_id, technician_id, note, status_change_to (nullable), created_at`

## Audit Logs — *Corrected: promoted from mentioned-but-absent to core schema entity*
`id, user_id, action, entity_type, entity_id, metadata (jsonb, nullable), created_at`
Immutable. Populated by the same actions that trigger notifications — no separate logging system needs to be built, just a table these actions also write to.

## Notifications
`id, user_id, type, message, entity_type, entity_id, read (boolean), created_at`

---

# 6. Relationships Summary

Plant 1—N Asset · Asset 1—N Inspection · Asset 1—N Defect · Inspection 1—N InspectionItem
Inspection 0/1—N Defect (a defect may or may not originate from an inspection) · Defect 0/1—1 Approval (only if Critical)
Defect 1—1 WorkOrder (once approved/non-critical) · WorkOrder 1—N MaintenanceUpdate

---

# 7. Constraints

Every table uses UUID primary keys. Email addresses unique. Asset codes unique. Inspection cannot exist without a valid Asset reference. Defect cannot reference a non-existent Inspection if `inspection_id` is set (nullable is fine — standalone defects are valid). Work Order cannot exist without a Defect.

---

# 8. Indexing Strategy

Index: `email`, `asset_code`, `plant_id`, `status` (on assets/defects/work_orders), `severity`, `created_at`, `defect_id` (on work_orders and approvals).

---

# 9. Audit Strategy

Audit logging records: User, Action, Timestamp, Entity Type, Entity ID, Metadata. Audit records are immutable — no update or delete operations should exist for this table, even in the mock backend.

---

# 10. Data Validation Rules

Email: RFC compliant. Asset Code: unique. Inspection: cannot be submitted twice (idempotent submit). Severity, Status, Role: enum-constrained values only.

---

# 11. Security

Passwords never stored in plaintext (bcrypt hash even in the mock backend — this is cheap to do correctly and worth doing right). JWT tokens never persisted server-side; only user IDs stored. Database access restricted to backend only.

---

# 12. Genuinely Future Database Expansion

Vendors, Spare Parts, Equipment Manuals, Predictive Maintenance tables, QR scan-event logging (as opposed to QR code *display*, which needs no new table).

---

# 13. Naming Standards

Tables: plural, snake_case. Columns: snake_case. Primary Key: `id`. Foreign Keys: `entity_id`. Booleans: `is_` prefix where it reads naturally (e.g. `is_active`) but `read` is acceptable for notifications since `is_read` reads awkwardly — consistency matters more than blind rule-following here. Timestamps: `created_at`, `updated_at`.

---

# 14. Performance Considerations

Index frequently searched fields, foreign keys, status, and date columns. Pagination mandatory on all list endpoints. No `SELECT *` in queries.

---

# 15. Seed Data Requirement *(new section — entirely absent from prior draft, and necessary for a demoable system)*

For the frontend to be demoable in a viva (i.e., look like a real system with history, not an empty shell), the mock backend needs seed data covering:

- **2–3 plants** (e.g., Pune, Chakan, Nashik — matching the Client Profile)
- **15–25 assets** across **4–5 asset types**, distributed across plants
- **A checklist template per asset type** (5–8 items each, with at least one `requires_photo: true` item per template)
- **A mix of inspection states:** some completed (pass), some completed (fail, with linked defects), some still pending/overdue
- **Defects across all four severity levels and multiple statuses** (open, pending_approval, approved, rejected, work_order_created, resolved) — critically, include at least 2–3 Critical defects still `pending_approval` so the Approval Queue view and Dashboard "Critical Defects" KPI have something real to show
- **Work orders in multiple Kanban states** (Open, Assigned, In Progress, Completed) so the board doesn't look empty or single-column
- **A handful of audit log entries and notifications** spanning the last 1–2 weeks, so the Audit Log timeline and Notifications panel have realistic-looking history rather than a single timestamp cluster

This seed data should be written once, early (Week 1, per Implementation Plan), and treated as a fixture — not regenerated ad hoc per module, which would cause inconsistent demo data across screens.

---

# 16. Conclusion

The EAOP data model is designed around operational workflows, not generic CRUD entities. Work Orders, Approvals, and Audit Logs are core to this model — not future additions — because the business workflow they support (`Defect → Approval → Work Order → Maintenance`) is the platform's central narrative.
