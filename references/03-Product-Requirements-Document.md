# Enterprise Asset Operations Platform (EAOP)
# Product Requirements Document (PRD)

---

**Document ID:** EAOP-PRD-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Executive Summary

EAOP is a web-based enterprise application designed to digitize inspection, defect, approval, and maintenance workflows for industrial assets, replacing paper-based inspections, disconnected spreadsheets, and manual communication with a centralized workflow-driven platform.

---

# 2. Product Vision

Develop a modern enterprise web platform that enables organizations to manage the complete lifecycle of industrial asset inspections and maintenance through a secure, scalable, and user-friendly interface.

---

# 3. Product Goals

Digitize inspection workflows, improve maintenance coordination, reduce manual paperwork, provide real-time operational visibility, improve compliance readiness, maintain complete asset history, enable data-driven decision making.

---

# 4. Target Users

**Primary:** Inspectors, Maintenance Technicians, Supervisors, Plant Managers
**Secondary:** System Administrators, Quality Assurance Team, HSE Officers

---

# 5. User Personas

**Inspector** — completes scheduled inspections, records observations, reports defects. Needs: fast inspection process, tablet-friendly interface, easy photo uploads, clear inspection history.

**Supervisor** — reviews inspection results, approves or rejects critical defects. Needs: a clear approval queue, team visibility, inspection summaries.

**Maintenance Technician** — executes work orders generated from approved defects. Needs: an assigned work list (Kanban board), asset details, simple progress updates.

**Plant Manager** — monitors overall plant operations. Needs: KPIs, asset health, compliance reports, operational dashboards, visibility into critical defects awaiting approval.

---

# 6. Functional Requirements

## Asset Registry
- Display all registered assets with search and filtering.
- Display asset detail: general info, generated QR code image, inspection history, defect history.

## Inspection Module
- Load inspection checklist templates dynamically based on asset type.
- Validate required fields; support pass/fail per checklist item.
- Support image attachments per checklist item.
- Save and submit inspection responses.
- ~~Support digital signatures~~ — **removed.** Explicitly out of scope; see PDD §16 for rationale. Any prior reference to signature capture in this document set is superseded by this correction.

## Defect Management
- Create defects (standalone or from an inspection).
- Assign severity: Low, Medium, High, Critical.
- Upload supporting images.
- Display and filter by defect status.
- **Approval action:** for Critical severity defects, a Supervisor or Plant Manager can approve or reject directly from the defect detail screen (with a comment). This is intentionally NOT a separate module/screen system — it's an action state on the defect itself, which keeps the feature lean while still delivering the "approval routing" narrative.

## Work Orders
- Generated automatically when a defect is approved (or directly for non-critical defects that don't require approval).
- Kanban board with four columns: Open → Assigned → In Progress → Completed.
- Status can be changed via a simple action (button-based status change is acceptable; drag-and-drop is a nice-to-have, not required).
- Record assigned technician, priority, and completion notes.

## Reports
- Generate Inspection, Defect, Maintenance, and Compliance reports.
- Filter by date range, plant, severity/status.
- Export to CSV; PDF export if time permits (CSV is the MVP requirement, PDF is a stretch goal).

## Dashboard
Displays: Total Assets, Pending Inspections, Open Defects, Critical Defects (awaiting approval), Open Work Orders, Inspection Completion Rate, Asset Health Summary. All values are derived from the modules above — the dashboard has no independent data entry.

## Notifications
- Lightweight panel (not a full page): inspection due/overdue, critical defect raised, work order assigned, work order completed.
- Polling-based is acceptable; real-time websockets are not required for MVP.

## Audit Trail
- Read-only, chronological, filterable timeline of state-changing actions (who did what, when, on which entity).
- Fed by the same actions other modules already perform — this should not require a custom logging UI to build, only a table and a list view.

---

# 7. Non-Functional Requirements

**Performance:** Dashboard loads in under 2 seconds; search results within 1 second.
**Security:** Role-based authorization, JWT authentication (simplified for demo, documented as such), HTTPS in any real deployment.
**Scalability:** Architecture should conceptually support multiple plants and thousands of assets, even though seed data is modest.
**Reliability:** Graceful error handling, data validation, no blank screens on failure.
**Accessibility:** Keyboard navigation, WCAG AA contrast, responsive layouts.

---

# 8. Product Modules & Priority

| Module | Priority |
|---|---|
| Authentication (mock) | High |
| Dashboard | High |
| Asset Registry | High |
| Inspection | High |
| Defect Management (incl. approval action) | High |
| Work Orders (Kanban) | High |
| Reports | High |
| Notifications | Medium |
| Audit Log | Medium |
| Settings | Low (may be stubbed, not fully built) |

**Correction:** Work Orders is elevated from "Medium" (as in a prior draft) to "High" — it is a load-bearing part of the core lifecycle narrative and the richest frontend artifact in the build (Kanban board). Deprioritizing it was an inconsistency, not a deliberate design choice.

---

# 9. User Stories

**Inspector:** "As an Inspector, I want to complete digital inspections on a tablet, so that I no longer need paper forms."

**Supervisor:** "As a Supervisor, I want to see all defects awaiting my approval in one place, so nothing critical is missed."

**Maintenance Technician:** "As a Technician, I want to see my assigned work orders on a status board, so I know what to work on next."

**Plant Manager:** "As a Plant Manager, I want dashboards and reports, so I can monitor plant performance without waiting for monthly compilation."

---

# 10. Acceptance Criteria

The MVP is complete when:
- Users can log in (per role).
- Assets are displayed with working search/filter.
- Inspections can be completed end-to-end, including a dynamic per-asset-type checklist.
- Defects can be logged, and critical defects can be approved/rejected.
- Approved defects generate work orders visible on the Kanban board.
- Reports are viewable and filterable.
- Dashboard displays live KPIs derived from the above, not static/mock numbers.
- Role-based access and navigation function correctly.

---

# 11. Out of Scope

See PDD §16 for the full list with rationale. Summary: Financial Accounting, Procurement, Payroll, HR, Inventory, Production Planning, ERP Replacement, Machine Control, digital signatures, QR camera scanning, light theme, native mobile app, IoT, predictive maintenance, multi-language.

---

# 12. Success Metrics

**Operational:** 100% digital inspections, reduced inspection completion time, reduced reporting effort.
**Technical:** Responsive UI, stable REST integration, minimal runtime errors.
**Business:** Improved visibility, faster maintenance response, better compliance readiness.

---

# 13. Risks

- Changing scope mid-build (mitigated by this locked document set).
- Underestimating the Work Order + Approval scope — mitigated by keeping approval as an in-line action rather than a separate module, and the Kanban board simple (button-based status change as the baseline, drag-and-drop only if time allows).
- Large seed datasets affecting frontend performance — mitigated by pagination from day one, not retrofitted later.

---

# 14. Assumptions

Backend APIs are available (via the mock/stub backend built alongside the frontend). Authentication is simplified but functional. Asset master data is seeded. Users have role-based permissions.

---

# 15. Definition of MVP

Login, Dashboard, Asset Registry, Inspection Module, Defect Management (with approval action), Work Orders (Kanban), Reports. Notifications and Audit Log are included but can be the simplest version described above. Settings/Admin screens may be minimally stubbed.

---

# 16. Definition of Done

A feature is complete when: UI matches the design brief; API integration is functional against the mock backend; validation is implemented; responsive behavior is verified for its target device class; and documentation is updated.

---

# 17. Conclusion

This PRD defines the functional and non-functional expectations for EAOP. It should be consulted before implementing any new feature — and takes precedence over any other document if a conflict exists on functional scope.
