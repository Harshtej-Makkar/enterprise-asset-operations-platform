# EAOP Reference Documentation — Correction Audit
### What changed from the original 18-document draft, and why

---

This document exists so you (and any AI agent picking this up) can understand *why* the reference set looks the way it does, not just *what* it says. Keep it in the repo root or reference folder as a record — it's also genuinely useful content for your internship report's "planning and documentation" section, since it demonstrates a real engineering review process.

---

## The one critical, systemic issue

**Work Orders, Approval Workflow, and Audit Log were treated as core in some documents and "future release" in others — a self-contradicting document set.**

Trace the original inconsistency:
- **Business Workflow Document** and **Product Definition Document**: described the core lifecycle as `Defect → Approval → Work Order → Maintenance → Reports → Dashboard`. Central, load-bearing steps.
- **PRD's MVP definition, Frontend Scope's assigned modules, Implementation Plan's MVP scope and phases, API Contract's endpoint list, Data Model's core entities, Component Library's component list**: all pushed Work Orders (and, in most cases, Approval and Audit Log entirely) to "future release," alongside genuinely future items like QR scanning and offline mode.

This wasn't a deliberate, reasoned scope cut — it was an inconsistency that crept in and then propagated, because each document was internally coherent on its own but never cross-checked against the others.

**Why this mattered enough to fix rather than just note:** the Kanban board (which only exists if Work Orders is in scope) is the single richest, most differentiating frontend artifact in this entire project. Every other module in the original 5-module MVP (Dashboard, Assets, Inspection, Defects, Reports) is fundamentally a table-and-form pattern repeated five times. The Kanban board is the one screen that visually and interactively demonstrates a *workflow state machine* — which is the actual thesis of this whole project ("the dashboard is the result of business processes, not the starting point"). Cutting it undermines the project's central pitch while claiming to preserve it.

**The fix:** Work Orders, the Approval action, and Audit Log are now core MVP everywhere, consistently — but scoped deliberately lean so this correction doesn't blow up the 6-week timeline:
- **Approval** is an action block on the Defect Detail screen, not a separate module with its own routes and screens.
- **Work Orders** requires only button-based Kanban status changes as the baseline; drag-and-drop is optional polish.
- **Audit Log** is a read-only timeline reusing the same `Timeline` component and the same action log that already powers Notifications — it should be one of the cheapest screens to build, not a burden.

---

## Other corrections made

| Issue | Found In | Fix |
|---|---|---|
| Digital signature listed as a requirement | PRD §6 | Removed. Explicitly out of scope — disproportionate build cost (canvas capture, image encoding, storage) for the narrative value |
| "Desktop First" blanket responsive rule, contradicting inspectors' actual tablet use on the shop floor | TRD §16, UX Standards §24 | Corrected to module-dependent: tablet-first for Inspection/Defect Logging, desktop-first for Dashboard/Reports/Kanban/Assets |
| Both light and dark theme required for MVP | UX Standards §27, Design Tokens §21, Component Library §2 | Corrected to single dark theme for MVP; light theme moved to future scope. Halves design/QA surface with no narrative cost |
| No committed color values or typeface — token *names* only, defaulting implicitly to generic AI choices (Inter, blue) | Design Tokens (entire doc), UX Standards §10–11 | Committed to a real, deliberate palette (dark, industrial, amber signature-accent) and typeface (IBM Plex Sans/Mono) with actual hex values throughout |
| Border radius scale went up to 16px ("Extra Large") | Design Tokens §6 | Corrected to a sharper max of 6px — soft, heavily rounded corners read as consumer/playful, wrong tone for industrial software |
| QR code handling inconsistent — "future" in three places, implied as built in another | Client Profile, PDD, Business Workflow, PRD | Resolved: QR *display* (client-side generated image per asset) is in scope; QR *scanning* (camera integration) is out of scope |
| Technician role missing from the API permissions table | API Contract §17 (orig.) | Added, with a full row alongside the other four roles |
| Component Usage Matrix only covered 5 of the (correctly-scoped) 8 modules | Component Library §12 (orig.) | Expanded to cover Work Orders, Notifications, Audit Log |
| No seed/demo data specification anywhere | Data Model (missing section) | Added §15 — explicit requirement for enough seeded plants/assets/inspections/defects/work-orders so a viva demo shows a system with real history, not an empty shell |
| AI Agent Instructions' priority reading list omitted the Data Model and Application Flow documents | AI Agent Instructions §4 (orig.) | Added both — this omission is likely *why* the Work Order gap went unnoticed across so many documents simultaneously; an agent following the old list would never have cross-checked against the two documents that most clearly showed the contradiction |

---

## What was already good and preserved with minimal changes

- **Client Organization Profile** — genuinely strong, specific, believable. Only touched for the QR code framing fix.
- **Repository Structure Specification** — well thought out, including the `report-content/` folder for internship report materials, which is a genuinely useful addition beyond what a generic document template would include. Only touched to move Work Orders/Notifications/Audit from "future" to Week 1 feature folders.
- **Engineering Guidelines** — solid, practical, no conceptual issues. Only extended with naming examples for the newly-confirmed-core entities.
- **Business Workflow Document** — this was actually the one document that got the Work Order/Approval scope *right* from the start. It's the reason the contradiction was catchable at all — everything else should have matched it, and now does.

---

## How to use this corrected set

1. Read the **Project Manifest** first — it's the source of truth and explicitly states the priority order if any document still conflicts with another.
2. Feed the **entire `/reference` folder** to your AI coding agent at project start, not a subset — the corrections depend on documents cross-referencing each other correctly.
3. Follow the **Implementation Plan's** week-by-week order exactly — it's now mapped to your real calendar (22 June – 31 July) and each week's deliverable is designed to visibly build on the last, which is exactly what you want to be able to narrate in your weekly report and viva.
4. If you or an AI agent ever finds another inconsistency during the build, resolve it by checking the **Project Manifest's "Source of Truth Priority Order"** — and consider adding a note to this audit document, the same way this one documents its own corrections.
