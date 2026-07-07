# Enterprise Asset Operations Platform (EAOP)
# AI Agent Instructions

---

**Document ID:** EAOP-AI-001
**Version:** 1.1 (Corrected)
**Status:** Active
**Audience:** AI Coding Agents (Claude Code, Cursor, Windsurf, Codex, Gemini CLI)

---

# 1. Purpose

Operational instructions for AI coding agents contributing to EAOP. Ensures AI-generated code stays consistent with architecture, engineering standards, business requirements, and internship context.

**Read this document, and the Project Manifest, before making any modifications to the project.**

---

# 2. Project Context

EAOP is an enterprise web application developed by Netsity Technologies for a manufacturing client, digitizing Asset Management, Inspections, Defect Tracking (with Approval), Work Orders, Reporting, and Operational Dashboards.

The repository represents a collaborative enterprise project, with a Web Development Intern's frontend contribution at its center — not an individual academic assignment, and not a solo full-stack project either.

---

# 3. Internship Context

The assigned developer is a **Web Development Intern**. Responsibilities: frontend implementation across all 8 core modules (see §4 of the Frontend Scope document), UI development, API integration, responsive design, shared components, documentation. The intern also builds the necessary minimal mock/stub backend (see Frontend Scope §16) — this is scaffolding, not the deliverable itself, and should be kept honest and minimal, never elaborately production-hardened.

The intern is **not** responsible for real backend architecture, authentication design, database design, infrastructure, CI/CD, or DevOps — these are represented by the mock backend, not actually built to production standard.

---

# 4. Documents to Read (Priority Order) — Corrected

1. Project Manifest
2. Product Requirements Document
3. Technical Requirements Document
4. Solution Architecture Document
5. Data Model & Database Design
6. API Contract Specification
7. Business Workflow Document
8. Application Flow Document
9. Frontend Scope & Module Ownership
10. Frontend Design & UX Standards
11. Design Tokens Specification
12. Component Library
13. Repository Structure
14. Engineering Guidelines

**Correction:** Data Model and Application Flow are added to this list — a prior draft omitted them, which is how the Work Order/Approval/Audit Log gaps went unnoticed across so many documents simultaneously. If there is a conflict between documents, follow the one higher in this list, and treat the Project Manifest's "Source of Truth Priority Order" section as final.

---

# 5. Development Workflow

For every feature: understand the business requirement → identify required API endpoints (per API Contract) → reuse existing components (per Component Library) before creating new ones → build the feature → verify responsiveness (per its target device class, TRD §16) → verify accessibility → update documentation. Follow the weekly build order in the Implementation Plan — do not jump ahead to later-week modules before earlier ones are functional, since later modules (Dashboard, Reports) depend on earlier ones producing real data.

---

# 6. General Rules

Always: write TypeScript in strict mode, follow the repository structure, use reusable components, use the committed design tokens (real hex values — see Design Tokens doc, not placeholder names), follow engineering guidelines, keep components small and focused, prefer composition over duplication.

---

# 7. Never Do The Following

Do not: invent new business requirements, modify the architecture without instruction, introduce unnecessary dependencies, hardcode mock data into production components (seed data belongs in the database/seed layer, not sprinkled through component code), place API requests directly inside UI components, duplicate existing components, ignore accessibility, create new design patterns when existing ones are available, default to Inter font or a generic blue palette (the committed IBM Plex Sans + industrial dark palette is specified for a reason — see Design Tokens and UX Standards docs).

---

# 8. UI Rules

Use existing layout, form, table, and feedback components. Maintain visual consistency across all modules, including the ones added in this corrected version — Work Orders (Kanban), Notifications, Audit Log.

---

# 9. API Rules

All API communication through the service layer, using TanStack Query, handling loading/empty/success/error states, following the (corrected, now-complete) API Contract Specification — including the Work Order, Approval, and Audit Log endpoints that a prior draft omitted.

---

# 10. Component Rules

Before creating a new component: check the Component Library → determine if an existing one can be reused → extend if appropriate → create new only when necessary. This includes checking for `KanbanBoard`, `Timeline`, and `ApprovalActionBlock` before building anything similar from scratch — they are already specified.

---

# 11. Feature Development Rules

One feature at a time, per the Implementation Plan's weekly order. A feature is complete only when: UI implemented, API integrated, validation complete, responsive (per target device class), accessible, error handling complete, documentation updated.

---

# 12. Code Quality Standards

Readable, modular, maintainable, well-typed, consistent. Avoid unnecessary abstraction or overengineering — this applies especially to the mock backend, where a simple, direct implementation of business rules (e.g., the severity-triggers-approval check) is correct, and a generalized rule engine would be over-engineering for this project's actual scope.

---

# 13. Testing Expectations

Check TypeScript types, verify responsive layouts (per target device class), test validation, loading states, empty states, error states — for every module, including Work Orders and Audit Log, which a prior draft's testing checklist never covered since it never scoped them in the first place.

---

# 14. Documentation Responsibilities

Update relevant documentation (README, API notes, weekly report) whenever component behavior, API usage, architecture, or folder structure changes.

---

# 15. Communication Style

Explain what was built, list modified files, mention assumptions, highlight any deviations from the specification, suggest the next logical task. Avoid unnecessary explanation.

---

# 16. Handling Missing Information

If required information is missing: do not guess, identify the ambiguity, state what additional information is needed, wait for clarification.

---

# 17. Out of Scope — Corrected

**Do not implement**, unless explicitly instructed:

- Digital signature capture
- QR code camera scanning (QR *display*, generated client-side from an asset code, IS in scope — see Asset Registry module)
- Light theme / theme switching
- Native mobile application
- IoT integration
- Predictive maintenance / ML defect prediction
- Vendor management, spare parts tracking
- Multi-language support

**Correction:** An earlier draft of this list also implicitly excluded Work Orders by omission from every other document — Work Orders, Approval actions, and Audit Log are **core MVP scope**, not out of scope. If any other document in this set still states otherwise, this document set's Version 1.1 corrections (see Project Manifest) take precedence.

---

# 18. Success Criteria

A successful implementation matches this (corrected) documentation, uses shared components, follows engineering guidelines, integrates correctly with the mock API, is production-quality frontend code, and is maintainable by another developer — or by the same developer six months later.

---

# 19. Final Principle

When multiple implementation options exist, choose the one that best aligns with the existing architecture, maximizes code reuse, minimizes complexity, and improves long-term maintainability. Consistency is more valuable than novelty.

---

# 20. Conclusion

These instructions define how AI coding agents should contribute to EAOP, now fully aligned with the corrected 8-module MVP scope (Dashboard, Assets, Inspection, Defects with Approval, Work Orders, Reports, Notifications, Audit Log) that runs consistently through every document in this reference set.
