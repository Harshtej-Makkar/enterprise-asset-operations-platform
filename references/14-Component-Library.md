# Enterprise Asset Operations Platform (EAOP)
# Component Library

---

**Document ID:** EAOP-COMP-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the reusable React components used throughout EAOP, promoting consistency, maintainability, and reuse.

**Correction note:** An earlier draft listed the Kanban Board under "Future Components" (§15), out of MVP scope. This directly contradicted the rest of the document set, where Work Orders (which require a Kanban board) are core. Corrected below — Kanban Board is now a core Data Display component.

---

# 2. Component Design Principles

Reusable, composable, strongly typed, accessible, responsive, business-logic-free. **Single theme only for MVP** (see Design Tokens §21 — an earlier draft required light/dark theme support per component; this is corrected).

---

# 3. Component Categories

```
components/
├── layout/ ├── navigation/ ├── data-display/ ├── forms/
├── feedback/ ├── charts/ ├── overlays/ ├── common/ └── ui/
```

---

# 4. Layout Components

**AppShell** — primary authenticated layout (Sidebar + TopBar + Content).
**Sidebar** — active route highlighting, collapse support, role-based item visibility, mobile drawer mode. Contains all 8 core module links from the start (see App Flow §17).
**TopBar** — breadcrumbs, search, notifications, user menu.
**PageContainer** — consistent page padding/layout.
**PageHeader** — title, subtitle, actions.

---

# 5. Navigation Components

**Breadcrumb**, **NavItem** (icon, label, badge, active state), **UserMenu**.

---

# 6. Data Display Components — Corrected

**StatCard** — dashboard KPIs (title, value, icon, trend, color).

**DataTable** — sorting, filtering, pagination, loading/empty states, row selection. Used throughout.

**StatusBadge** — supports the full status set from Design Tokens §19, including Critical, Pending Approval, Approved, Rejected, Work Order Created, Assigned, In Progress.

**InfoCard** — grouped information (Asset Details, Inspection Summary, Report Summary).

**Timeline** — chronological events. Used for Recent Activity **and the Audit Log** *(the Audit Log's primary UI need — this component was already specified for "Recent Activity" in a prior draft, so building the Audit Log screen mostly means reusing it with a different data source, not building something new)*.

**Kanban Board / Kanban Card** *(corrected from "Future Components" to core)* — used for Work Orders. Structure: `KanbanBoard` renders four `KanbanColumn`s (Open, Assigned, In Progress, Completed), each containing `KanbanCard`s. Status change via a card action menu ("Move to...") is the required baseline interaction; drag-and-drop (optionally via `dnd-kit`, which is compatible with the existing stack) is an enhancement, not a requirement — see Frontend Scope §10.

**ApprovalActionBlock** *(new component, needed for Defect Detail)* — a conditional section shown only when a Defect is Critical severity and status is `pending_approval`, and only to Supervisor/Plant Manager roles. Contains Approve/Reject buttons and a comment field. This is intentionally a component within the Defect feature, not a standalone module — keeping the "approval is an action, not a separate system" scope decision visible in the component architecture itself.

---

# 7. Form Components

FormSection, TextInput, NumberInput, TextArea, SelectField, DatePicker, FileUpload (image upload, drag-and-drop, preview), SearchInput, FilterPanel (Status, Date Range, Search, Plant, Severity).

---

# 8. Chart Components

ChartCard (wrapper: Title, Actions, Chart, Legend), LineChartWidget, BarChartWidget, PieChartWidget, AreaChartWidget. All via Recharts.

---

# 9. Feedback Components

EmptyState, LoadingSkeleton, ErrorState (message + retry button — no illustration needed, matches the tone register in UX Standards §21), Toast (Success/Error/Warning/Info).

---

# 10. Overlay Components

Modal, ConfirmDialog (used before destructive actions, and before approval/rejection actions given their workflow significance), Drawer (mobile/tablet navigation).

---

# 11. Common Components

Avatar, Badge, Divider, IconButton, Pagination, Spinner (fallback only — Skeletons remain preferred).

---

# 12. Component Usage Matrix — Corrected

**An earlier draft's matrix only covered five modules, omitting Work Orders, Notifications, and Audit Log entirely. Corrected below.**

| Component | Dashboard | Assets | Inspections | Defects | Work Orders | Reports | Audit Log |
|---|---|---|---|---|---|---|---|
| AppShell | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sidebar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| TopBar | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| PageHeader | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| StatCard | ✓ | | | | | | |
| DataTable | | ✓ | ✓ | ✓ | | ✓ | |
| Kanban Board | | | | | ✓ | | |
| Timeline | ✓ | | | | | | ✓ |
| ApprovalActionBlock | | | | ✓ | | | |
| StatusBadge | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ChartCard | ✓ | | | | | ✓ | |
| SearchInput | | ✓ | ✓ | ✓ | | ✓ | ✓ |
| FilterPanel | | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| EmptyState | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| LoadingSkeleton | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Toast | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| ConfirmDialog | | ✓ | ✓ | ✓ | ✓ | | |

---

# 13. Component Rules

No API calls or business logic inside components. Data via props. Feature-agnostic. Accessible. Minimal necessary props.

---

# 14. Component Development Standards

TypeScript interfaces, JSDoc where necessary, loading/error states if applicable, accessibility support, responsive behavior (per the component's module's target device class — see TRD §16).

---

# 15. Genuinely Future Components

QR Scanner (camera-based), Map Viewer, Calendar, Rich Text Editor, File Preview beyond images.

**Correction:** Kanban Board is no longer listed here — see §6 above.

---

# 16. Conclusion

This Component Library establishes the reusable building blocks for EAOP, now correctly including the Kanban Board and Approval components that the rest of the document set's business workflow always assumed existed.
