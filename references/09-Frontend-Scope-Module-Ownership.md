# Enterprise Asset Operations Platform (EAOP)
# Frontend Scope & Module Ownership Document (FSMOD)

---

**Document ID:** EAOP-FS-001
**Version:** 1.1 (Corrected)
**Status:** Approved
**Assigned Developer:** Web Development Intern

---

# 1. Purpose

Defines the frontend implementation scope assigned to the Web Development Intern, distinguishing it from Backend, QA, DevOps, and Architecture responsibilities.

**Correction note:** An earlier draft of this document assigned only five modules (Dashboard, Asset Registry, Inspection, Defect Management, Reports) to the intern, explicitly excluding Work Orders, Approval, and Audit Log as "future modules outside internship scope." This contradicted the Business Workflow and Architecture documents, which treat these as core to the platform's central lifecycle. This version corrects that — restoring them to the intern's scope, but with explicit guidance on keeping each one lean (see §5–§10 below) so the correction doesn't blow up the 6-week timeline.

---

# 2. Internship Context

```
Client → Business Analysts → Solution Architect
──────────────────────────
Backend Team · Frontend Team · QA Team · DevOps Team
──────────────────────────
        ↓
Web Development Intern
```

The intern contributes to frontend implementation, in this case working solo with an AI coding agent standing in for the rest of the frontend team's pairing/review support.

---

# 3. Assigned Responsibilities

Implementing responsive frontend interfaces, building reusable React components, integrating with REST APIs (the mock/stub backend), managing loading/empty/error states, client-side validation, frontend documentation, frontend testing, resolving UI bugs.

---

# 4. Responsibilities Not Assigned

Backend architecture, authentication implementation, database schema design, business rule implementation, API development (beyond the necessary mock/stub — see §11), CI/CD, infrastructure, security architecture, production deployment, requirement gathering.

---

# 5. Assigned Modules — Corrected

| Module | Ownership | Scope Note |
|---|---|---|
| Dashboard | Full Frontend | |
| Asset Registry | Full Frontend | Includes QR code image display (generated client-side from asset code — no scanning) |
| Inspection Module | Full Frontend | Dynamic checklist per asset type |
| Defect Management | Full Frontend | **Includes the Approval/Reject action** for Critical-severity defects, built as an action on the Defect Detail screen — not a separate approval module. This keeps the feature genuinely intern-scoped: one screen gains a conditional action block, rather than a whole new module with its own routes, list views, and permissions matrix. |
| **Work Orders** | **Full Frontend** *(corrected from excluded)* | Kanban board with **button-based status change** as the required baseline. Drag-and-drop is optional polish, not a requirement — don't let it become a time sink. |
| Reports | Full Frontend | CSV export required; PDF is a stretch goal |
| **Notifications** | **Full Frontend** *(corrected from excluded)* | A simple panel, polling-based (re-fetch on an interval or on panel open) — no websockets needed |
| **Audit Log** | **Full Frontend** *(corrected from excluded)* | Read-only timeline, reads from the same log Notifications already uses — this should be one of the cheapest modules to build, not a burden |

Settings/Admin remains a minimal stub (Low priority per PRD) — described in the report as existing conceptually, without requiring deep implementation.

---

# 6. Dashboard Module

KPI Cards, Charts, Recent Activity, Inspection Summary, Defect Summary, Responsive Layout, Empty States, Error Handling.

APIs consumed: `GET /dashboard`, `GET /dashboard/kpis`, `GET /dashboard/recent`

---

# 7. Asset Registry Module

Asset Table, Search, Filters, Asset Details (incl. QR code image), Pagination, Responsive Table.

APIs consumed: `GET /assets`, `GET /assets/:id`

---

# 8. Inspection Module

Inspection List, Inspection Form (dynamic per asset type), Validation, Image Upload UI, Submission Confirmation.

APIs consumed: `GET /inspections`, `GET /inspections/:id`, `POST /inspections`, `POST /inspections/:id/submit`

---

# 9. Defect Management Module — Corrected to Include Approval

Defect Form, Severity Selection, Image Upload, Status Display, Defect Table, Filters, **and the Approve/Reject action block on Defect Detail for Critical severity defects, visible only to Supervisor/Plant Manager roles.**

APIs consumed: `GET /defects`, `POST /defects`, `GET /defects/:id`, `PATCH /defects/:id/status`, `POST /defects/:id/approval`

---

# 10. Work Order Module *(new section — corrected from "excluded")*

Kanban board with four columns (Open, Assigned, In Progress, Completed), Work Order Detail view, technician assignment display, priority/deadline display, completion notes.

**Explicit scope guardrail:** implement status change as a button/menu action first ("Move to In Progress"). Only add drag-and-drop (e.g., via `dnd-kit`, already compatible with the existing stack) if the four other modules are done and there's genuine time left in the schedule. A working button-based Kanban board demonstrates the same workflow-state UI pattern in the viva as a drag-and-drop one — the visual payoff doesn't depend on the interaction method.

APIs consumed: `GET /work-orders`, `GET /work-orders/:id`, `PATCH /work-orders/:id/status`, `PATCH /work-orders/:id/assign`

---

# 11. Shared Components

DataTable, SearchBar, FilterPanel, KPI Card, Status Badge, Empty State, Loading Skeleton, Page Header, Breadcrumb, Confirmation Dialog, Modal, Toast Notifications, **Kanban Board / Kanban Card** *(added — needed for Work Orders, was missing from a prior draft's shared component list despite being needed)*, **Timeline** *(added — needed for Audit Log)*.

---

# 12. Design Responsibilities

Responsive implementation (per the module-dependent rule in the TRD — tablet-first for Inspection/Defect Logging, desktop-first elsewhere), accessibility, component consistency, single-theme implementation (see corrected theme scope in TRD §18), layout implementation.

---

# 13. State Management Responsibilities

Local UI State, Form State, Server State (TanStack Query), Route State. Business state remains on the backend (even the mock one) — the frontend should not, for example, compute severity-triggers-approval logic client-side; it should call an endpoint and render the result.

---

# 14. API Integration Responsibilities

Data fetching, error handling, loading states, optimistic UI where appropriate (e.g., Kanban status change can optimistically update before the mock API confirms), data presentation. API design remains conceptually a backend responsibility, even though the intern is also the one building the mock backend — see §16 below for how to keep that honest.

---

# 15. Testing Responsibilities

UI Testing, Responsive Testing, API Integration Testing, Manual Feature Testing, Bug Verification. Backend testing is outside internship scope (the mock backend needs to work correctly, not be exhaustively tested).

---

# 16. On Building the Mock Backend — Explicit Guardrail

Since no separate backend team actually exists for this build, the intern (with AI agent assistance) will build a minimal mock/stub backend so the frontend has something real to integrate against. This is necessary scaffolding, not part of the internship's frontend deliverable — keep it honest and minimal:

- Implement the endpoints in the API Contract Specification, correctly, with the schema in the Data Model doc.
- Keep business logic direct and simple (e.g., `if (severity === 'critical') defect.status = 'pending_approval'` is enough — do not build a generalized configurable rule engine).
- Do not spend significant time on backend security hardening, scalability, or infra-as-code — it needs to return correct data reliably for a demo, not survive production traffic.
- Document simplifications explicitly in the backend README (e.g., "Auth uses a simplified JWT flow suitable for a demo; a production system would use httpOnly cookies and refresh rotation").
- Keep commit messages distinguishing `feat(mock-api): ...` from `feat(inspection): ...` etc., so the Git history itself supports the internship narrative under examination.

---

# 17. Documentation Responsibilities

Component documentation, README, weekly report/sprint journal, API usage notes, frontend architecture notes.

---

# 18. Deliverables

Dashboard UI, Asset Registry UI, Inspection Module UI, Defect Management UI (incl. approval action), **Work Order Kanban UI**, Reports UI, **Notifications UI**, **Audit Log UI**, Shared Component Library, Responsive Layout, API Integration, Documentation.

---

# 19. Definition of Done

UI matches design brief · API integration functional · validation implemented · responsive per module's target device class · accessibility verified · error handling implemented · loading states implemented · documentation updated.

---

# 20. Learning Outcomes

Enterprise React Development, REST API Integration, Component-Based Architecture, TypeScript, Responsive Design, Data Visualization, Workflow-State UI Patterns (Kanban), Documentation, Agile Development Practices.

---

# 21. Conclusion

The Web Development Intern contributes to EAOP by implementing the full set of core frontend modules — Dashboard, Asset Registry, Inspection, Defect Management (with approval), Work Orders (Kanban), Reports, Notifications, and Audit Log — each scoped to stay achievable within 6 weeks, while collaborating (via an AI coding agent) on the minimal backend needed to make all of it real. This document defines that scope precisely and is the primary reference for evaluating the internship contribution.
