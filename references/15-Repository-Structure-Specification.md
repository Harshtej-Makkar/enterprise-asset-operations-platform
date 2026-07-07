# Enterprise Asset Operations Platform (EAOP)
# Repository Structure Specification

---

**Document ID:** EAOP-REPO-001
**Version:** 1.1 (Corrected)
**Status:** Approved

---

# 1. Purpose

Defines the official repository structure for EAOP — consistent, scalable, maintainable, usable by a developer working with an AI coding agent.

**Correction note:** An earlier draft listed `work-orders/`, `notifications/`, `maintenance/`, and `audit/` under "Future Expansion" (§22). Corrected below: these are core feature folders from Week 1, matching the corrected MVP scope everywhere else in this document set.

---

# 2. Repository Overview

```
EAOP/
├── reference/
├── report-content/
├── frontend/
├── backend/
├── database/
├── docs/
├── screenshots/
├── scripts/
├── .github/
├── .gitignore
├── docker-compose.yml
├── README.md
└── .env.example
```

---

# 3. Reference Folder

Contains this document set (00 through 17), considered read-only once approved — changes go through a documented correction, as this version itself demonstrates.

---

# 4. Report Content Folder

```
report-content/
├── company-profile/
├── internship-details/
├── project-background/
├── weekly-diary/
├── screenshots/
├── viva/
├── presentation/
└── resume/
```

Independent of application source code — this is genuinely useful scaffolding for the actual internship report deliverable, and worth populating incrementally each week rather than all at once in Week 6.

---

# 5. Frontend Structure

```
frontend/src/
├── app/ ├── assets/ ├── components/ ├── features/ ├── hooks/
├── layouts/ ├── pages/ ├── services/ ├── contexts/ ├── types/
├── utils/ ├── constants/ ├── styles/ ├── validation/ └── routes/
```

---

# 6. Feature-Based Organization — Corrected

**Core features from Week 1, not added incrementally:**

```
features/
├── dashboard/
├── assets/
├── inspections/
├── defects/          (includes the approval action UI)
├── work-orders/       ← corrected: core, not future
├── reports/
├── notifications/     ← corrected: core, not future
├── audit/             ← corrected: core, not future
└── settings/          (minimal stub)
```

Each feature contains: `components/`, `hooks/`, `pages/`, `services/`, `types/`, `validation/`. Business logic stays inside its feature.

---

# 7. Shared Components

```
components/
├── layout/ ├── navigation/ ├── tables/ ├── forms/
├── charts/ ├── feedback/ ├── dialogs/ └── common/
```

Generic and reusable — no business logic.

---

# 8. Layout Folder

```
layouts/
├── AppShell.tsx
└── AuthLayout.tsx
```

---

# 9. Pages

Route-level components only. Business logic belongs inside feature modules.

---

# 10. Services

```
services/api/
├── auth.service.ts
├── dashboard.service.ts
├── asset.service.ts
├── inspection.service.ts
├── defect.service.ts        (includes approval endpoint calls)
├── work-order.service.ts     ← added
├── report.service.ts
├── notification.service.ts   ← added
└── audit.service.ts          ← added
```

HTTP requests, response transformation, API configuration. No UI logic.

---

# 11. Hooks

```
hooks/
├── useAuth.ts
├── useDashboard.ts
├── useAssets.ts
├── useInspections.ts
├── useDefects.ts
├── useWorkOrders.ts     ← added
├── useReports.ts
├── useNotifications.ts   ← added
└── useAuditLog.ts        ← added
```

---

# 12. Types

```
types/
├── asset.ts ├── dashboard.ts ├── inspection.ts ├── defect.ts
├── approval.ts       ← added
├── work-order.ts       ← added
├── report.ts ├── user.ts ├── notification.ts ├── audit-log.ts       ← added
└── common.ts
```

---

# 13. Validation

```
validation/
├── login.schema.ts
├── inspection.schema.ts
├── defect.schema.ts
├── approval.schema.ts     ← added
└── report.schema.ts
```

Zod schemas.

---

# 14. Backend Structure (Mock/Stub)

```
backend/src/
├── controllers/ ├── routes/ ├── services/
├── repositories/ ├── middleware/ ├── validators/
├── config/ ├── utils/ └── types/
```

Controllers → HTTP layer. Services → (minimal, direct) business logic. Repositories → database interaction. Middleware → auth. Validators → request validation.

---

# 15. Database Structure

```
database/
├── schema/
├── migrations/
├── seed/     ← see Data Model §15 for the required seed data content
└── erd/
```

---

# 16. Documentation

```
docs/
├── api/ ├── deployment/ ├── architecture/ └── testing/
```

---

# 17. Screenshots

```
screenshots/
├── week-1/ ├── week-2/ ├── week-3/ ├── week-4/ ├── week-5/ ├── week-6/ └── final/
```

Used for the internship report — capture screenshots at the end of each week (per the Implementation Plan's weekly deliverables), not retroactively in Week 6.

---

# 18. Scripts

```
scripts/
├── seed.ts
├── reset-db.ts
└── generate-report.ts
```

---

# 19. Naming Conventions

Folders: lowercase, kebab-case where appropriate. Files: kebab-case. Components: PascalCase. Hooks: camelCase, `use` prefix. Services: `*.service.ts`. Validation: `*.schema.ts`. Types: singular nouns.

---

# 20. Import Rules

Order: external libraries → shared components → feature components → hooks → services → types → utilities → styles. Use absolute imports where configured.

---

# 21. Ownership Rules

Shared folders never depend on feature folders. Feature folders may depend on shared components. Business logic never lives in shared components. API requests only from the service layer.

---

# 22. Genuinely Future Expansion

```
features/
├── vendor-management/
├── spare-parts/
└── predictive-maintenance/
```

No structural changes should be required when adding these later, since the feature-based pattern already accommodates new modules cleanly.

---

# 23. Conclusion

This repository structure provides a modular, feature-oriented foundation for EAOP, now correctly including Work Orders, Notifications, and Audit Log as Week 1 feature folders rather than deferred additions.
