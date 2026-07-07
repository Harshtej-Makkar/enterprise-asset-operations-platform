# Enterprise Asset Operations Platform (EAOP)
# Technical Requirements Document (TRD)

---

**Document ID:** EAOP-TRD-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

This document defines the technical architecture, development standards, technology stack, coding conventions, and engineering constraints for EAOP. All developers and AI coding agents must follow this document.

---

# 2. Engineering Goals

Modular, scalable, maintainable, type-safe, accessible, responsive, easy to extend. Prioritize maintainability over premature optimization.

---

# 3. System Architecture

```
React Frontend → REST API (mock/stub backend) → PostgreSQL Database
```

Authentication via JWT (simplified implementation, documented as a known simplification — see Backend Schema doc). The frontend communicates exclusively through REST APIs and never touches the database directly.

---

# 4. Technology Stack

**Frontend:** React 19, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui, Lucide Icons, React Hook Form, Zod, TanStack Query, TanStack Table, Recharts

**Backend (mock/stub):** Node.js, Express.js, TypeScript

**Database:** PostgreSQL

**Deployment:** Vercel (frontend) · Railway or Render (backend) · Neon PostgreSQL (database)

---

# 5. Folder Structure

```
project/
  reference/
  frontend/src/{components,pages,layouts,hooks,services,types,contexts,utils}
  backend/src/{controllers,routes,services,middleware}
  database/{schema,seed}
  docs/
```

See `15-Repository-Structure-Specification.md` for the complete, authoritative structure.

---

# 6. Frontend Architecture

Feature-first organization:

```
features/
  dashboard/ · assets/ · inspections/ · defects/ · work-orders/ · reports/
  notifications/ · audit/ · settings/
components/shared/{forms,tables,charts}
```

**Correction:** `work-orders/`, `notifications/`, and `audit/` are core feature folders from the start of the project, not additions bolted on later — this matches the corrected MVP scope in the PRD.

---

# 7. State Management

Server state → TanStack Query. Local UI state → React `useState`. Global state → React Context, used sparingly. Avoid Redux.

---

# 8. Routing

```
/login
/dashboard
/assets, /assets/:id
/inspections, /inspections/:id
/defects, /defects/:id
/work-orders
/reports
/notifications
/audit-log
/settings
```

**Correction:** `/work-orders` and `/audit-log` are present from the start — an earlier draft omitted them from the route map despite treating them as core modules elsewhere.

---

# 9. API Standards

REST naming conventions (`GET /assets`, `POST /inspections`, `PATCH /defects/:id/status`, etc.). JSON responses. Standard HTTP status codes. See `11-API-Contract-Specification.md` for the full contract, including Work Order and Approval endpoints.

---

# 10. Data Fetching

Always use TanStack Query. Never call `fetch` directly inside components.

```
Component → Hook → Service → API
```

---

# 11. Form Standards

React Hook Form + Zod. Every form: validation, error messages, loading states, success feedback.

---

# 12. Tables

TanStack Table. Sorting, filtering, pagination, row selection. Export where specified in PRD.

---

# 13. Charts

Recharts. Bar, Line, Pie, Area. Minimal animation.

---

# 14. Error Handling

Every API request handles: Loading, Success, Empty State, Error, Unexpected Error. No blank screens, ever.

---

# 15. Loading States

Skeleton UI preferred over spinners.

---

# 16. Responsive Design — Corrected Priority

**An earlier draft of this document specified "Desktop First" as a blanket rule. This is corrected here because it contradicted the client's own operational reality: inspectors use tablets on the shop floor, not desktops.**

The corrected rule is **module-dependent, not blanket desktop-first:**

| Module | Primary Target | Rationale |
|---|---|---|
| Inspection Execution, Defect Logging | **Tablet-first** (768–1024px), graceful degradation to 375px mobile width | This is where field users actually work |
| Dashboard, Reports, Work Order Kanban, Asset Registry, Settings | **Desktop-first** (1280px+), functional down to tablet | These are management/desk-based tasks |

Supported breakpoints: 1920, 1600, 1440, 1280, 1024, 768. Minimum supported mobile width: 375px (graceful degradation only for the two tablet-first modules above, not a design target for the rest).

---

# 17. Accessibility

All forms: labels, keyboard support, ARIA where appropriate, visible focus states. WCAG AA minimum.

---

# 18. Theming — Corrected Scope

**An earlier draft required both light and dark theme support from day one. This is corrected: MVP ships a single theme only.**

The single theme is a dark, high-contrast, industrial-toned interface (full palette in `13-Design-Tokens-Specification.md`). This halves the design and QA surface for a 6-week build with no loss to the narrative — light theme and theme-switching are documented future scope (see PDD §16), and the token architecture (CSS variables) is still structured so adding a second theme later would not require restructuring.

---

# 19. Naming Conventions

Components: PascalCase (`InspectionCard.tsx`). Hooks: camelCase starting with `use` (`useInspection.ts`). Interfaces: PascalCase nouns (`Inspection`, `Asset`, `Defect`, `WorkOrder`). Constants: UPPER_SNAKE_CASE.

---

# 20. Code Style

Prefer small components, reusable logic, pure functions, strict typing. Avoid large components, magic numbers, deep prop drilling, duplicate logic.

---

# 21. Git Strategy

Branches: `main`, `develop`, `feature/*` (e.g. `feature/inspection`, `feature/work-orders`).

Commit format: `feat:`, `fix:`, `docs:`, `refactor:`, `style:`, `test:`. Frontend and mock-backend work should be distinguishable in commit prefixes (e.g. `feat(mock-api): ...` vs `feat(inspection): ...`) to keep the repo history consistent with the internship narrative — see `09-Frontend-Scope-Module-Ownership.md`.

---

# 22. Testing Strategy

**Frontend:** component testing for at least the dynamic checklist form, the severity badge logic, and one table's filter/sort logic; form validation testing; manual QA end-to-end per module.
**Backend (mock):** basic request/response shape testing is sufficient — this is a stub, not a service under real testing obligation.

---

# 23. Performance Goals

Dashboard <2s. API <500ms average (mock backend, so this should be trivial). Images lazy-loaded. Charts render efficiently.

---

# 24. Security

JWT authentication (simplified/documented), role-based authorization, protected routes, input validation, sanitized requests.

---

# 25. Logging

Frontend: console logging disabled in production builds. Backend: structured request logging, centralized error handling.

---

# 26. Documentation Rules

Every feature updates: README (if applicable), API documentation, weekly report/sprint journal, reference documents if architecture changes.

---

# 27. Definition of Done

UI matches design → API integrated → validation complete → responsive per module's target device class → accessible → tested → documentation updated → code reviewed (self-review, in the intern-solo-with-agent context).

---

# 28. Engineering Principles

1. Business workflow drives implementation.
2. Components should be reusable.
3. APIs are consumed, not bypassed.
4. Simplicity beats cleverness.
5. Documentation is part of development.
6. Code should be understandable six months later.
7. Consistency is more valuable than novelty.

---

# Conclusion

This TRD defines engineering standards for EAOP. Any deviation should be discussed and documented before implementation. The two corrections in this version (responsive priority, theme scope) apply retroactively to any other reference document that still states the old rule.
