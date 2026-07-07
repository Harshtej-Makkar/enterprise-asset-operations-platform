# Enterprise Asset Operations Platform (EAOP)
# Implementation Plan

---

**Document ID:** EAOP-IMP-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the engineering roadmap for implementing EAOP. Serves as the execution plan for the developer and AI coding agent(s).

**Correction note:** An earlier draft's MVP scope (§3) and phase list (§4) omitted Work Orders entirely, pushing it to "Future Releases" (§12) alongside genuinely future items like QR scanning and offline mode. This contradicted the rest of the document set. Corrected below — Work Orders is now Phase 5, part of the core MVP build.

---

# 2. Development Philosophy

Feature-by-feature. Each completed feature includes: UI, API Integration, Validation, Loading State, Error Handling, Responsive Design (per its target device class), Documentation.

---

# 3. MVP Scope — Corrected

The MVP contains **eight** primary modules (not five):

1. Authentication (mock)
2. Dashboard
3. Asset Registry
4. Inspection Module
5. Defect Management (including the Approval action)
6. **Work Orders (Kanban board)**
7. Reports
8. Notifications + Audit Log (lightweight, built together — see Phase 7)

Settings/Admin is a minimal stub, not a full MVP module.

---

# 4. Development Order, Mapped to the 6-Week Internship Calendar (22 June – 31 July)

## Week 1 (22–28 June) — Phase 0 + Phase 1: Setup & Foundations

- Repository setup: Vite, React, TypeScript, Tailwind, shadcn/ui
- Routing skeleton, authentication layout (mock JWT flow)
- Shared foundation: AppShell layout, Sidebar (with all 8 module links from day one, not added incrementally — this matters for the "product, not incremental app" narrative), TopBar, protected routes, error pages, loading components
- Mock backend scaffold + seed data (per Data Model §15) — enough real endpoints for frontend development to begin against actual data, not imagined shapes
- Design tokens implemented (per Design Tokens Specification) as Tailwind config / CSS variables
- **Deliverable:** empty-but-fully-navigable app shell; mock login works; sidebar shows all modules; seed data is loaded and queryable

## Week 2 (29 June – 5 July) — Phase 2 + Phase 3: Dashboard (shell) + Asset Registry + Inspection

- Dashboard: build the KPI card layout and chart containers now, even though they'll show near-zero data until Week 4–5 — this is a deliberate choice: it means the dashboard visibly "fills in" as later modules produce data, which is the literal demonstration of the "dashboard is the result, not the starting point" thesis in the viva
- Asset Registry: list, detail view, search/filter, QR code image display
- Inspection Module: due list, dynamic checklist execution form (schema-driven per asset type), photo upload, submission
- **Deliverable:** an inspector can view due inspections and complete one end-to-end; dashboard shows real (if sparse) numbers

## Week 3 (6–12 July) — Phase 4: Defect Management (with Approval)

- Defect List (filterable by severity/status/plant)
- Defect Detail screen
- Log Defect form (launchable from Inspection Execution or standalone)
- **Approval/Reject action block** on Defect Detail, visible conditionally to Supervisor/Plant Manager roles for Critical-severity defects
- **Deliverable:** a defect logged during inspection appears in the defect list; a critical defect can be approved, which triggers work order creation (even before the Kanban UI exists — the mock backend creates the record; Week 4 builds the view for it)

## Week 4 (13–19 July) — Phase 5: Work Orders

- Kanban board: four columns, button-based status change (baseline requirement)
- Work Order Detail screen
- Technician assignment display, priority/deadline display, completion notes
- If time allows: drag-and-drop polish via `dnd-kit` (optional, not required)
- **Deliverable:** approving a critical defect (or logging a non-critical one) visibly produces a card on the Kanban board; moving it through statuses updates asset history and dashboard KPIs

## Week 5 (20–26 July) — Phase 6: Reports + Dashboard Completion

- Reports Home + Report Viewer (Inspection, Defect, Maintenance, Compliance types; CSV export required, PDF if time allows)
- Dashboard: complete the KPI cards and trend charts now that Weeks 2–4 have produced real data to visualize — this is genuinely the payoff week
- **Deliverable:** dashboard reflects real state produced by all upstream modules; reports show real filtered, exportable data

## Week 6 (27–31 July) — Phase 7: Notifications, Audit Log, Polish, Deployment

- Notifications panel (polling-based)
- Audit Log timeline (reads from existing action log — should be quick given Weeks 1–5 already generate the underlying events)
- Responsive pass: verify Inspection Execution and Defect Logging specifically at tablet width (768–1024px)
- Bug fixing from an informal end-to-end QA pass (walk through every role's full journey yourself)
- Frontend README, component documentation, ADRs (see Architecture doc §21)
- Deploy: frontend (Vercel), mock backend (Railway/Render), database (Neon)
- Architecture diagram + ER diagram finalized for the internship report
- **Deliverable:** deployed, demoable link; documentation complete; ready for report writing and viva prep

---

# 5. Component Build Order

Build once, reuse everywhere. Priority: Button → Input → Card → Modal → Table → Search → Filter → Status Badge → KPI Card → Chart Wrapper → Empty State → Loading Skeleton → Toast → Dialog → **Kanban Board / Kanban Card** *(added — needed by Week 4)* → **Timeline** *(added — needed by Week 6)*.

---

# 6. API Integration Strategy

Integrate feature-by-feature, matching the weekly build order above. Do not connect every endpoint on day one.

---

# 7. Documentation Strategy

Every completed feature updates: README, weekly report/sprint journal entry, screenshots (organized by week — see Repository Structure), API notes.

---

# 8. Testing Strategy

Every feature: manual testing, responsive testing (against its target device class), validation testing, API integration testing. No feature is complete without this.

---

# 9. Git Strategy

One feature per branch where practical. Commits: `feat: inspection dynamic checklist`, `feat: work order kanban board`, `feat(mock-api): defect approval endpoint`, `fix: dashboard responsiveness`, `docs: update implementation notes`.

---

# 10. Definition of Ready

A feature may begin only if: requirements exist (PRD), API contract exists (API Contract Specification), design tokens/brief exist, and dependencies (per weekly plan above) are complete.

---

# 11. Definition of Done

UI complete · API integrated · responsive (per target device class) · accessible · validation complete · error handling complete · documentation updated · tested.

---

# 12. Genuinely Future Releases

QR camera scanning, offline mode, native mobile app, predictive maintenance, multi-language support, light theme/theme switching, digital signature capture, vendor/spare-parts management.

**Correction:** Work Orders is no longer listed here — see §3 and §4 above. Notifications and Audit Log are also no longer listed here — they are Week 6 deliverables, per the corrected MVP scope.

---

# 13. AI Development Rules

Build one feature at a time, following the weekly order above. Never skip shared components. Never duplicate logic. Always update documentation. Never implement genuinely-future-release features (§12) unless explicitly instructed. Prefer composition over duplication. Ask for clarification if requirements conflict — and if a conflict is with an outdated statement elsewhere in this document set, treat this Implementation Plan and the Project Manifest as authoritative (see Manifest §"Source of Truth Priority Order").

---

# 14. Success Criteria

Every module in §3 functions correctly, end-to-end, with real (seeded) data flowing through the full lifecycle from Inspection through Work Order to Dashboard. All pages responsive per their target device class. Documentation complete. Application deployment-ready.

---

# Conclusion

EAOP should be built incrementally, mapped to the real 6-week internship calendar above, with Work Orders correctly restored to core MVP scope alongside Dashboard, Assets, Inspection, Defects, and Reports.
