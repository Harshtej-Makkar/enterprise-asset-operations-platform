# Enterprise Asset Operations Platform (EAOP)
# Solution Architecture Document (SAD)

---

**Document ID:** EAOP-ARCH-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines system boundaries, application layers, responsibilities, communication between components, module ownership, and deployment architecture. Intentionally avoids implementation details.

---

# 2. Architectural Goals

Modular, maintainable, scalable, secure, testable, easy to extend. Business workflows remain independent from UI implementation.

---

# 3. High-Level System Architecture

```
Users → React Frontend → REST API (Express, mock/stub) → PostgreSQL
```

Authentication occurs before protected API access.

---

# 4. Layer Responsibilities

**Presentation Layer (React):** UI, forms, tables, charts, navigation, validation feedback, API consumption.

**Application Layer (Express):** Business rules, authorization, validation, workflow execution, API endpoints. (Minimal/mock in this build — see doc 09.)

**Data Layer (PostgreSQL):** Persistent storage, relationships, constraints, transactions.

---

# 5. Repository Structure

See `15-Repository-Structure-Specification.md`.

---

# 6. Frontend Architecture — Corrected

**An earlier draft of this diagram omitted Work Orders, Approval, Notifications, and Audit Log despite these being core modules elsewhere in the document set. Corrected below.**

```
App
├── Authentication
├── Dashboard
├── Assets
├── Inspection
├── Defects (includes approval action on critical defects)
├── Work Orders (Kanban board)
├── Reports
├── Notifications
├── Audit Log
├── Settings
└── Shared Components
```

Each feature owns its own pages, components, hooks, services, validation, and types.

---

# 7. Backend Architecture (Mock/Stub)

```
Controllers → Services → Repositories → Database
```

Controllers receive requests; Services hold (intentionally minimal) business logic; Repositories handle database access. This separation is preserved even in the mock backend so the frontend integrates against realistic API behavior — but the actual logic inside each layer should stay simple and direct (see doc 09 for the explicit "don't over-build this" guardrail).

---

# 8. Module Responsibilities

**Dashboard** — displays operational KPIs, consumes `GET /dashboard/*`. Read-only; no direct data entry.

**Asset Registry** — displays industrial assets; search, filter, detail view with generated QR code image.

**Inspection** — dynamic checklist forms per asset type, attachments, validation.

**Defect Management** — severity, images, comments, status, and the approval/reject action for Critical-severity defects.

**Work Orders** — Kanban board (Open → Assigned → In Progress → Completed), generated from approved/non-critical defects, assigned to technicians.

**Reports** — filters, export, search.

**Notifications** — lightweight panel, polling-based.

**Audit Log** — read-only timeline of state-changing actions across all modules above.

**Settings** — minimal stub; full admin configuration is not required for MVP demo purposes.

---

# 9. Authentication Flow

```
User → Login → JWT Issued (mock, simplified) → Token Stored → Protected Requests
→ API Authorization → Response
```

The frontend never manages authentication *logic* directly — it consumes a token and attaches it to requests. See Backend Schema doc for the documented simplification (token storage approach) appropriate for a demo build.

---

# 10. Request Flow

```
React Component → TanStack Query → API Service → REST Endpoint → Controller
→ Service → Repository → Database → JSON Response → Frontend Update
```

---

# 11. Module Ownership

**Frontend Team (the intern's role in this project):** UI, components, routing, forms, tables, charts, API integration for Dashboard, Assets, Inspection, Defects (incl. approval action UI), Work Orders (Kanban), Reports, Notifications, Audit Log.

**Backend Team:** Authentication, APIs, business logic, validation, database. (Represented in this build by the minimal mock/stub — see doc 09.)

**QA:** Functional and regression testing.

**DevOps:** Deployment, CI/CD, monitoring.

---

# 12. Internship Contribution

The Web Development Intern contributes to: Dashboard, Asset Registry, Inspection, Defect Management (incl. the approval action UI), Work Orders (Kanban board), Reports, Notifications, Audit Log, responsive layout, API integration, frontend testing.

**Correction:** Work Orders, the approval action, and Audit Log are included here — an earlier draft's module ownership table omitted them, inconsistent with this document's own module responsibilities section above.

The intern does NOT own: database, authentication, backend architecture, infrastructure.

---

# 13. API Communication

REST-based. Example: `GET /dashboard → JSON → TanStack Query → Dashboard Cards`. The frontend never accesses the database directly.

---

# 14. Data Ownership

```
Assets → Inspection Records → Defects → Approvals → Work Orders → Maintenance
→ Reports → Dashboard KPIs
```

Each entity has a single authoritative source. **Correction:** Approvals is now an explicit link in this chain — an earlier draft's data-ownership diagram skipped straight from Defects to Work Orders, which didn't match the approval-gate business rule described elsewhere in this same document set.

---

# 15. Security Architecture

Authentication: JWT (simplified). Authorization: Role-Based Access Control. Transport: HTTPS in any real deployment. Validation: backend-owned; the frontend should never rely on client-side validation alone, even in a mock system.

---

# 16. Deployment Architecture

```
Vercel (frontend) → HTTPS → Express Backend (Railway/Render) → PostgreSQL (Neon)
```

---

# 17. Error Handling Strategy

**Frontend:** friendly error messages, retry actions, empty states.
**Backend:** standard HTTP codes, structured JSON errors, logging.

---

# 18. Logging Strategy

Frontend: minimal production logging. Backend: structured request logging, centralized error handling.

---

# 19. Scalability Considerations

Future support: multiple organizations, thousands of assets, multiple facilities, increased inspection volume, mobile application. The architecture should support growth conceptually, without requiring major redesign — though this build's actual seed data and infra are modest by design.

---

# 20. Architecture Principles

Separation of Concerns · Single Responsibility · Modular Features · Reusable Components · API-First Design · Type Safety · Documentation-Driven Development

---

# 21. Architecture Decision Records

Suggested ADRs to actually write during the build (useful both for engineering rigor and for your internship report's "technical decisions" section):
- Why React over other frontend frameworks?
- Why a Kanban board (button-based status change) instead of a generic status dropdown for Work Orders?
- Why fold Approval into the Defect detail screen instead of a separate Approval module?
- Why REST instead of GraphQL for this scope?

---

# 22. Conclusion

EAOP follows a layered, modular architecture suitable for enterprise software development, with responsibilities clearly separated between frontend, backend, QA, and DevOps — and, within frontend, clearly scoped to what a Web Development Intern plausibly built.
