# ADR-003: Approval on Defect Detail, Not a Separate Module

- **Status:** Accepted
- **Date:** 2026-07-13
- **Deciders:** EAOP Development Team

## Context

When an Inspector logs a defect with `severity = 'critical'`,
the defect enters `pending_approval` status. Only Critical-severity
defects require approval (per the business rule in the Workflow
document and the actual backend implementation at
`defects.controller.ts` line 127); High/Medium/Low defects proceed
directly to `open` status without an approval gate. A Supervisor or
Plant Manager must review and either approve or reject it before a
work order can be created.

We evaluated two approaches:

1. **Separate Approval module** — a dedicated `/approvals` route with its
   own list view showing all pending-approval defects in one place.
2. **Inline approval on Defect Detail** — approval actions (Approve /
   Reject + optional comment) live directly on the existing
   `DefectDetail.tsx` page, visible only to users with the right role.

## Decision

We chose **inline approval on Defect Detail**. There is no separate
`/approvals` route or Approval module in the navigation.

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| **Separate `/approvals` module** | Adds a 10th feature module for a single workflow step; duplicates the defect details view (approver needs defect context to decide); increases navigation complexity for Supervisors who already have the Defect List as their primary view. |
| **Dashboard-embedded approval widget** | Conflates the Dashboard (aggregate view) with an action workflow; approval of safety-critical defects should happen on a dedicated detail page with full context, not a summary card. |

## Rationale

1. **Context preservation** — The approver sees the full defect context
   (asset, inspection that triggered it, photos, severity) on the same
   page where they make their decision. A separate module would require
   navigating away or duplicating context.
2. **Role-gated UI** — The Approve/Reject buttons are conditionally rendered
   based on the current user's role (`supervisor` or `plant_manager`) and
   the defect's status (`pending_approval`). This keeps the UI simple for
   Inspectors (who only see "Submit for Approval").
3. **Single source of truth** — Defect status transitions (`open` →
   `pending_approval` → `approved`/`rejected` → `work_order_created` →
   `resolved`) are all managed on one page. No risk of two modules showing
   stale or conflicting status.
4. **Smaller surface area** — 13 files vs. the ~25 files a separate module
   would require (list, detail, create, routes, types, components, hooks).

## Consequences

- **Positive:** Supervisors see pending-approval defects in the Defect List
  with a prominent status badge; clicking through gives them full context
  before deciding.
- **Positive:** Audit trail is cleaner — all defect-related events
  (`defect_logged`, `defect_submitted_for_approval`, `defect_approved`,
  `defect_rejected`) originate from the same logical location.
- **Negative:** No dedicated "Approval inbox" view — Supervisors must
  filter the Defect List by `pending_approval` status. A future enhancement
  could add a saved filter or dashboard widget without introducing a new module.