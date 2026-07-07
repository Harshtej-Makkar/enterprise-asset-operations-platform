# Enterprise Asset Operations Platform (EAOP)
# Application Flow Document

---

**Document ID:** EAOP-APPFLOW-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines navigation structure, user journeys, screen hierarchy, routing strategy, and page-level responsibilities. Primary reference for frontend development.

---

# 2. Application Philosophy

The application is designed around operational workflows rather than isolated pages. Every screen exists to support a business objective.

---

# 3. Navigation Structure — Corrected

**An earlier draft of this diagram omitted Work Orders and Audit Log entirely, despite both being core modules per the Business Workflow and (corrected) Architecture documents. Corrected below.**

```
Login
  ↓
Dashboard
  │
  ├── Assets
  ├── Inspections
  ├── Defects (includes Approval action for Critical severity)
  ├── Work Orders (Kanban board)
  ├── Reports
  ├── Notifications
  ├── Audit Log
  └── Settings
```

Dashboard is the primary entry point after authentication.

---

# 4. Route Map — Corrected

| Route | Description |
|---|---|
| /login | Authentication |
| /dashboard | Executive Dashboard |
| /assets | Asset Registry |
| /assets/:id | Asset Details (incl. QR code image, inspection & defect history) |
| /inspections | Inspection List |
| /inspections/new | New Inspection |
| /inspections/:id | Inspection Details / Execution |
| /defects | Defect List |
| /defects/:id | Defect Details (includes Approve/Reject action for Critical defects) |
| **/work-orders** | **Work Order Kanban Board** *(added — missing from prior draft)* |
| **/work-orders/:id** | **Work Order Detail** *(added)* |
| /reports | Reports |
| /notifications | Notifications |
| **/audit-log** | **Audit Trail Timeline** *(added — missing from prior draft)* |
| /settings | User & System Settings (minimal stub) |

---

# 5. Authentication Flow

```
User → Login → Credentials Validated (mock) → JWT Issued → Dashboard
```

Unauthenticated users may only access the Login page.

---

# 6. Dashboard Flow

```
Dashboard → KPI Cards → Charts → Recent Inspections → Critical Defects Awaiting Approval
→ Quick Actions
```

Users navigate directly to related modules from dashboard widgets (e.g., clicking "Critical Defects: 3" navigates to `/defects?severity=critical&status=pending_approval`).

---

# 7. Asset Flow

```
Asset List → Search → Filter → Asset Details → Inspection History → Defect History
```

The Asset Detail page is the central hub for all asset-related information, including the generated QR code image.

---

# 8. Inspection Flow

```
Inspection List → Select Asset → Inspection Form (dynamic checklist per asset type)
→ Validation → Submit → Inspection Summary
```

If a checklist item is marked "Fail," the UI offers a direct "Log Defect" action, feeding into the Defect Flow below without losing inspection context.

---

# 9. Defect Flow — Corrected to Include Approval

```
Inspection (or standalone) → Create Defect → Severity Selection → Attach Images → Submit
→ Defect Details
   → If Critical: Approval action visible to Supervisor/Plant Manager roles only
      → Approve → Work Order auto-created → redirect option to view it on the Kanban board
      → Reject → Defect returned to Inspector with comment
   → If not Critical: Work Order auto-created directly
```

**Correction:** An earlier draft's defect flow ended at "Defect Details" and noted only that "critical defects may trigger approval workflows (handled by backend)" without ever surfacing that approval as a real screen/action. It is now explicit that this happens on the Defect Detail screen itself.

---

# 10. Work Order Flow *(new section — was entirely absent from prior draft)*

```
Work Order Created (from an approved/non-critical defect)
  ↓
Appears in "Open" column of Kanban board
  ↓
Maintenance Manager assigns a Technician → moves to "Assigned"
  ↓
Technician starts work → moves to "In Progress", adds notes
  ↓
Technician completes repair → moves to "Completed"
  ↓
Asset history and Dashboard both reflect the update
```

The Kanban board supports button-based status change as the MVP baseline; drag-and-drop is a nice-to-have enhancement if time allows in Week 4 (see Implementation Plan).

---

# 11. Reports Flow

```
Reports → Select Report Type → Apply Filters → Generate → Preview → Export (CSV; PDF if time allows)
```

---

# 12. Notifications Flow

```
Notifications → Unread → Open → Linked Module → Mark Read
```

---

# 13. Audit Log Flow *(new section — was entirely absent from prior draft)*

```
Audit Log → Filter by entity type / user / date range → Chronological Timeline
→ Click entry → Navigate to the related entity (defect, work order, inspection, etc.)
```

This is a read-only view — no create/edit actions exist on this screen. It reads from the same action log that powers Notifications, so building it should not require new backend logic beyond what other modules already generate.

---

# 14. Settings Flow

```
Settings → Profile → Preferences → Password → About
```

Full administrative configuration (user management, checklist template editor) is a minimal stub for MVP — described in documentation as existing, but not necessarily deeply built out, since it's Low priority per the PRD.

---

# 15. User Journeys — Corrected

**Inspector:** Login → Dashboard → Assets → Select Asset → Start Inspection → Log Defect (if needed) → Submit Inspection → Logout

**Supervisor:** Login → Dashboard → Defects (Approval Queue view) → Review & Approve/Reject Critical Defect → Reports → Logout

**Maintenance Technician:** Login → Dashboard → Work Orders (Kanban) → Update assigned card status → Logout *(added — a prior draft had no journey for this role at all, despite it being a defined persona)*

**Plant Manager:** Login → Dashboard → Defects (approve critical items) → Work Orders (oversight) → Reports → Asset Overview → Logout

---

# 16. Navigation Principles

Maximum three clicks to any primary task. Breadcrumbs on detail pages. Persistent sidebar navigation. Context-aware actions.

---

# 17. Sidebar Navigation — Corrected

```
Dashboard
Assets
Inspections
Defects
Work Orders
Reports
Notifications
Audit Log
Settings
Logout
```

---

# 18. Header Components

Every authenticated page: Page Title, Search, Notifications, User Menu.

---

# 19. Common UI Patterns

Tables: search, sort, filter, pagination. Forms: validation, error messages (draft-saving is future scope). Cards: status indicators, quick actions. Charts: tooltips, legends, filters.

---

# 20. Empty States

Every module needs a meaningful empty state with a clear call-to-action, e.g., "No inspections have been completed yet." — including the Work Order board ("No work orders yet — they'll appear here once a defect is approved") and Audit Log ("No activity recorded yet").

---

# 21. Error States

Every page handles: network errors, permission errors, empty results, server errors, always with a recovery path.

---

# 22. Loading States

Skeleton loaders, not blocking spinners. Large tables support progressive loading.

---

# 23. Responsive Behavior — See TRD §16 for the corrected module-dependent rule

Inspection Execution and Defect Logging are tablet-first. Dashboard, Reports, Work Orders (Kanban), and Asset Registry are desktop-first, functional down to tablet.

---

# 24. Accessibility

Keyboard navigation, screen readers, visible focus indicators, semantic HTML.

---

# 25. Future Navigation

Multi-plant switching, global command palette, recently viewed assets, favorites, quick search, keyboard shortcuts.

---

# 26. Conclusion

EAOP is designed around clear operational workflows with intuitive navigation. Every page supports a defined business process — including Work Orders and Audit Log, which are corrected into this document's scope to match the rest of the reference set.
