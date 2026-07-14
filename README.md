# Enterprise Asset Operations Platform (EAOP)

> **Internship capstone — Web Development Intern build · 6-week sprint (22 Jun – 31 Jul 2026)**

A workflow-driven enterprise platform that digitises industrial asset inspections, defect management, approval routing, maintenance coordination, reporting, and operational visibility.

This repository is structured as a real consulting-firm build would be: a feature-based React frontend, a minimal mock/stub backend (deliberately so, per the internship narrative), a PostgreSQL schema with seed data, and complete engineering documentation.

## Repository layout

```
EAOP/
├── references/         Approved planning documents (00 – 17). Read-only.
├── frontend/           React 19 + TypeScript + Vite + Tailwind + shadcn/ui
├── backend/            Minimal mock/stub Express + TypeScript REST API
├── database/           PostgreSQL schema + seed data
├── docs/               Generated technical documentation
├── screenshots/        Dated screenshots for the internship report
└── scripts/            Helper scripts
```

## Week 1 deliverable (this build)

This commit establishes the project foundations:

- ✅ Vite + React 19 + TypeScript + Tailwind + shadcn/ui scaffold
- ✅ Design tokens (IBM Plex Sans/Mono, exact dark/industrial palette) wired through Tailwind + CSS variables
- ✅ App shell: persistent sidebar (all 9 module links), top bar, role-protected routes
- ✅ TanStack Query + axios service layer with simplified JWT auth
- ✅ Login page, AuthContext, protected/public route guards
- ✅ Minimal Express + TypeScript backend (auth + dashboard endpoints)
- ✅ PostgreSQL schema covering all 15 core entities from the data model
- ✅ Seed data: 3 plants, 20 assets, 5 checklist templates, defects across all 4 severities and all 6 statuses (including 3 Critical `pending_approval`), work orders in all 4 Kanban columns, audit log + notifications, 5 demo users
- ✅ 16-route skeleton (all module URLs navigable from Day 1)

## Running locally

### Prerequisites

- Node.js 20+
- npm 10+
- (Optional) PostgreSQL 14+ — only needed if you want to point the backend at a real database. The default in-memory mode works without it.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # optional, defaults are fine
npm run dev                  # http://localhost:5173
```

### Backend

```bash
cd backend
npm install
cp .env.example .env         # edit JWT_SECRET if you like; defaults are fine for local dev
npm run dev                  # http://localhost:4000
```

The frontend Vite dev server proxies `/api` to the backend at `http://localhost:4000`, so the two run together without CORS hassle.

### Database (optional)

If you have a PostgreSQL instance, you can apply the schema and seed:

```bash
psql "$DATABASE_URL" -f database/schema/001-schema.sql
psql "$DATABASE_URL" -f database/seed/seed.sql
```

Then set `DATABASE_URL` in `backend/.env` to switch the backend from in-memory mode to PostgreSQL mode.

## Demo accounts

All accounts use the password `password123`:

| Email | Role | Plant |
|---|---|---|
| `admin@eaop.local` | Administrator | — |
| `plant.manager@eaop.local` | Plant Manager | Pune |
| `supervisor@eaop.local` | Supervisor | Pune |
| `inspector@eaop.local` | Inspector | Pune |
| `technician@eaop.local` | Maintenance Technician | Pune |

## Important scope notes (from the reference documents)

- **Single dark theme only** for MVP. Light theme is documented as future scope (TRD §18, DocTokens §21).
- **No drag-and-drop required for Work Order Kanban** — button-based status change is the MVP baseline (FSMOD §10). Drag-and-drop is optional polish.
- **Approval is an action on the Defect Detail screen**, not a separate module (FSMOD §9).
- **Notifications are polling-based**, not real-time (PRD §6).
- **The mock backend is intentionally minimal** — it returns correct seeded data, not a production backend (FSMOD §16). Documented simplifications live in `backend/README.md`.

## Deployment

### CRITICAL: Uploads environment variable

**Set `VITE_UPLOADS_BASE_URL` to your deployed backend's public URL (e.g. `https://your-backend.railway.app`) in your Vercel project's environment variables before deploying the frontend.** If this is left unset or wrong, all inspection/defect photos will silently fail to load — they'll try to fetch from `localhost:4000`, which won't exist in production.

The mechanism (see `frontend/src/lib/utils.ts`, `toAbsolutePhotoUrl`) prepends this base URL to relative `/uploads/*` paths returned by the backend API. In dev, the built-in default (`http://localhost:4000`) is correct because both servers run on the same machine. In production, the environment variable overrides the default and must point to wherever your backend is deployed.

## Project structure references

The full Week 1–6 plan, route map, data model, and design tokens are in the `references/` folder. Any future agent or developer joining the build should start there.
