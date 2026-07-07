# EAOP — Backend (Mock/Stub)

> **Status:** Week 1 scaffold. Not a production backend. Documented as such.

## Purpose

This service exists so the frontend has something real to integrate against. It is a stand-in for "the backend team's work" in the internship narrative, and is intentionally minimal per `09-Frontend-Scope-Module-Ownership.md` §16:

> *"Implement the endpoints in the API Contract Specification, correctly, with the schema in the Data Model doc. Keep business logic direct and simple… Do not spend significant time on backend security hardening, scalability, or infra-as-code."*

## What it does (Week 1)

- Issues JWTs on `POST /api/auth/login` against the seeded users
- Returns the current user from `GET /api/auth/me`
- Returns real-looking KPIs from `GET /api/dashboard/kpis` (derived from seed data)
- Returns the 10 most recent audit log entries from `GET /api/dashboard/recent`

That's it. The remaining routes (assets, inspections, defects, work-orders, reports, notifications, audit) come online feature-by-feature in Weeks 2–6 per the Implementation Plan.

## Documented simplifications

| Concern | This build | Production would |
|---|---|---|
| Token storage | JWT in localStorage (frontend) | httpOnly cookies + refresh rotation |
| Password storage | bcrypt cost 10 (correct) | Same, plus rotation policy |
| Authorization | Single role check from JWT claim | RBAC matrix per route, server-side enforced |
| Database | In-memory seed (default) or PostgreSQL | PostgreSQL with migrations, connection pooling tuned for traffic |
| Logging | Console request log | Structured logger → log aggregation |
| Error handling | Generic 500 + message | Error classification, user-facing vs internal split |
| Infra | None | Containerised, CI/CD, observability stack |

These are intentional. Documenting them is the point.

## Running

```bash
npm install
cp .env.example .env
npm run dev
```

The server starts on `http://localhost:4000`. Health check: `GET /api/health`.

## Data

The seed data lives in two places:

1. **`database/seed/seed.sql`** — the canonical, version-controlled seed. Run this against PostgreSQL to load the data.
2. **`src/repositories/memory-store.ts`** — the same data, in TypeScript, so the server can serve it without requiring a database to be running locally. The in-memory mode is the default; if `DATABASE_URL` is set, the server can be extended to use the `pg` pool directly.

When extending this layer in later weeks, prefer adding SQL-backed repositories in `src/repositories/*.repository.ts` that read from the `pg` pool — keeping the same response shapes that the frontend already expects.
