# ADR-002: Button-Based Kanban for Work Orders

- **Status:** Accepted
- **Date:** 2026-07-13
- **Deciders:** EAOP Development Team

## Context

The Work Order Board (`frontend/src/features/work-orders/`) requires
a Kanban view with 4 columns: Open, Assigned, In Progress, Completed.
Technicians drag work orders between columns; supervisors reassign
work items.

We evaluated two interaction models:

1. **Drag-and-drop Kanban** — cards are draggable between columns using
   HTML5 drag events or a library like `@dnd-kit/core`.
2. **Button-based Kanban** — each card has "Move to X" action buttons
   that trigger a status transition via API call.

## Decision

We chose the **button-based Kanban** approach. Cards are rendered in
4 column containers. Each card exposes contextual action buttons
(e.g., "Start Work", "Mark Complete", "Reassign") that call
`PATCH /api/work-orders/:id/status`.

No drag-and-drop library is used.

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| **@dnd-kit + HTML5 drag** | Drag-and-drop is fragile on touch devices; 4-column drag zones require precise hit targets; mobile/tablet users benefit more from explicit action buttons. |
| **React Beautiful DnD** | Unmaintained since 2022; React 19 compatibility uncertain; Atlassian has deprecated the package. |
| **Mixed approach (drag on desktop, buttons on mobile)** | Two code paths increase maintenance burden and testing surface area by 2× for a niche interaction. |

## Rationale

1. **Touch-first reliability** — The Work Order Board is a primary
   interface for Technicians, who may use tablets on the shop floor.
   Buttons work reliably on all input modalities.
2. **Explicit state transitions** — Each button corresponds to a single
   `PATCH` call with a well-defined status transition. This eliminates
   ambiguity (e.g., dragging to the wrong column, network race conditions).
3. **Auditability** — Button clicks produce clear audit log entries
   (`work_order_status_changed` with `from`/`to` metadata) — more
   precise than drag-and-drop which can generate intermediate events.
4. **Simpler implementation** — No external dependency beyond the
   existing `@tanstack/react-query` mutation patterns; ~40% less code
   than a full drag-and-drop Kanban.

## Consequences

- **Positive:** Works identically on desktop, tablet, and mobile.
- **Positive:** Each status transition is auditable with unambiguous
  before/after states.
- **Negative:** Less visually "fluid" than drag-and-drop; requires an
  extra click per transition.
- **Negative:** No bulk drag-select or multi-card movement — but the
  PRD does not require bulk operations on the Kanban board.