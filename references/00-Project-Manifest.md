# Enterprise Asset Operations Platform (EAOP)
# Project Manifest

---

**Document ID:** EAOP-MANIFEST-001
**Version:** 1.1 (Corrected)
**Status:** Active
**Prepared By:** Engineering Team
**Audience:** Developers, AI Coding Agents, Architects, Contributors

---

# Purpose

This document is the single source of truth for the Enterprise Asset Operations Platform.

Every developer and AI coding agent MUST read this document before making architectural decisions, implementing features, modifying code, or generating documentation.

When conflicts arise, this document takes precedence over all other reference documents. Where this version (1.1) differs from an earlier draft, this version is correct — several MVP scope inconsistencies from the initial draft have been resolved here and propagated through every other reference document.

---

# Project Philosophy

EAOP is **not** a college project.

EAOP is designed as if it were a real enterprise software product developed by a software consulting company (Netsity) for a manufacturing client.

The codebase, architecture, documentation, commit history, and implementation should reflect production engineering practices rather than demonstration software.

---

# Product Vision

Build a workflow-driven enterprise platform that digitizes industrial asset inspections, defect management, approval routing, maintenance coordination, reporting, and operational visibility.

The software exists to solve real operational problems — not to demonstrate technology.

Business workflows always take priority over UI implementation.

---

# Core Principles

## Workflow First
Every feature must support an actual business workflow. Never create UI screens that do not correspond to a business process.

## Product Before Features
Do not think in terms of pages. Think in terms of an enterprise product. Every screen belongs to a larger operational workflow.

## Modular Architecture
Every feature should be independently maintainable. Components should be reusable. Business logic should be isolated.

## Simplicity Over Complexity
Choose the simplest architecture capable of supporting enterprise growth. Avoid unnecessary abstractions.

## Consistency
Naming conventions, API design, folder structure, and component architecture must remain consistent throughout the project.

---

# Internship Context

This repository represents a product developed by a software consulting company.

The documented internship story is:

- Backend architecture already exists.
- Authentication already exists.
- APIs are available.
- Database exists.
- DevOps pipeline exists.

The Web Development Intern contributes to frontend modules only. A minimal mock/stub backend exists to make the frontend fully functional for development and demonstration — it is a stand-in for "the backend team's work," not a production deliverable in itself. See `09-Frontend-Scope-Module-Ownership.md` for the explicit behavior guardrails this implies for an AI coding agent.

---

# Scope of Contribution

The intern's work includes:

- Dashboard
- Asset Registry
- Inspection Module
- Defect Management (including approval actions on defects)
- Work Orders (Kanban board)
- Reports
- Notifications (lightweight)
- Audit Log (read-only timeline)
- Responsive UI
- API Integration
- Frontend Testing
- Documentation

**Correction from earlier draft:** Work Orders, defect approval actions, and the audit log were previously scoped as "future release" in some reference documents. This was an inconsistency, not a deliberate cut — the business workflow and architecture documents always treated them as core to the platform's central lifecycle (`Inspection → Defect → Approval → Work Order → Maintenance → Reports → Dashboard`). They are core MVP, scoped leanly (see Implementation Plan for exactly how).

The intern does NOT own:

- Backend Architecture
- Authentication Design
- Database Design
- Infrastructure
- DevOps
- Production Deployment
- Business Requirements

Documentation may describe the complete product, but implementation and explanations should clearly distinguish between the overall system and the intern's assigned responsibilities.

---

# Technology Philosophy

**Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form, Zod, TanStack Query, TanStack Table, Recharts

**Backend (mock/stub, minimal):** Node.js, Express.js, TypeScript

**Database:** PostgreSQL

**Authentication:** JWT (simplified for demo purposes — documented as such, not hidden)

**Deployment:** Vercel (frontend), Railway or Render (backend), Neon PostgreSQL (database)

Do not replace technologies without updating the Technical Requirements Document.

---

# Coding Philosophy

Priorities: Readability → Maintainability → Type Safety → Reusability → Performance.

Avoid clever code. Prefer understandable code.

---

# UI Philosophy

The application should feel like enterprise software — dense information, efficient workflows, consistent layouts, accessible, professional. Not a marketing website, portfolio, or generic admin template.

**Single theme for MVP:** a dark, high-contrast, industrial-toned interface (see UI/UX Brief and Design Tokens for the specific palette). Light theme and theme-switching are explicitly future scope — supporting both from day one doubles design and QA surface for no narrative benefit in a 6-week build.

---

# Documentation Philosophy

Every major feature should update: PRD, API documentation, architecture notes (if applicable), and the weekly report/sprint journal. Documentation is part of the feature, not an afterthought.

---

# AI Development Rules

AI agents should:
- ✓ Read all reference documents before implementing features.
- ✓ Respect the business workflow.
- ✓ Prefer reusable components.
- ✓ Avoid creating unnecessary abstractions.
- ✓ Generate production-quality frontend code.
- ✓ Keep the mock backend honest but minimal (see doc 09).
- ✓ Keep code strongly typed.
- ✓ Follow folder and naming conventions.
- ✓ Write meaningful comments only where necessary.
- ✓ Update documentation after implementation.

AI agents must NOT:
- ✗ Invent new business requirements.
- ✗ Add features outside the Product Requirements Document.
- ✗ Change the technology stack without updating the TRD.
- ✗ Change naming conventions.
- ✗ Introduce unnecessary libraries.
- ✗ Ignore accessibility.
- ✗ Duplicate logic.
- ✗ Break existing architecture.
- ✗ Implement digital signature capture, QR code scanning (camera), light-theme switching, or multi-language support — these are explicitly out of scope for this build (see PRD §16 for the full out-of-scope list and rationale).

---

# Repository Structure

```
/reference        Business and engineering documentation (this folder)
/report-content    Internship report materials (weekly diary, screenshots, viva prep)
/frontend          React application
/backend           Minimal mock/stub REST API
/database          Schema, seed data, ER diagram
/docs              Generated technical documentation
/screenshots       Dated screenshots for report evidence
```

---

# Source of Truth Priority Order

1. Project Manifest (this document)
2. Product Requirements Document
3. Client Organization Profile
4. Technical Requirements Document
5. Solution Architecture Document
6. Data Model & Database Design
7. API Contract Specification
8. Frontend Design & UX Standards / Design Tokens

If implementation conflicts with documentation, update the documentation before changing the implementation.

---

# Success Criteria

The finished project should satisfy four audiences simultaneously:

- **Client (fictional):** Solves a genuine operational problem, replaces a believable manual process.
- **Development Team:** Maintainable, modular, consistent codebase.
- **Internship Evaluation:** Believable, clearly-scoped contribution to a larger enterprise product.
- **Portfolio:** Professional project suitable for resume, GitHub, and interviews.

---

# Final Principle

Every implementation decision should answer this question:

> "Would this exist in a real enterprise product developed by a consulting company, and would a frontend intern plausibly have built exactly this piece of it?"

If the answer to either half is "No," redesign the solution before implementation.
