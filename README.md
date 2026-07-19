# Enterprise Asset Operations Platform (EAOP)

> **Internship capstone — Web Development Intern build · 6-week sprint (22 Jun – 31 Jul 2026)**

A workflow-driven enterprise platform that digitises industrial asset inspections, defect management, approval routing, maintenance coordination, reporting, and operational visibility.

**Live demo:** [enterprise-asset-operations-platfor.vercel.app](https://enterprise-asset-operations-platfor.vercel.app)

This repository is structured as a real consulting-firm build would be: a feature-based React frontend, a minimal mock/stub backend (deliberately so, per the internship narrative), a PostgreSQL schema with seed data, and complete engineering documentation.

---

## Repository layout

```
EAOP/
├── references/         Approved planning documents (00 – 17). Read-only.
├── frontend/           React 19 + TypeScript + Vite + Tailwind + shadcn/ui
├── backend/            Minimal mock/stub Express + TypeScript REST API
├── database/           PostgreSQL schema + seed data
├── docs/               Generated technical documentation (ADRs, architecture diagram, ER diagram)
├── screenshots/        Dated screenshots for the internship report
└── scripts/            Helper scripts
```

---

## Engineering highlights

| Feature | Status | Notes |
|---|---|---|
| **Asset Registry** | ✅ Complete | 20 assets across 3 plants, 5 types. Detail page with inspection/defect history. |
| **QR Code on Asset Detail** | ✅ Complete | Live `qrcode.react` SVG rendering of asset code. Ready for physical label scanning. |
| **Inspection Checklists** | ✅ Complete | Per-asset-type templates. Photo capture on items marked `requires_photo`. |
| **Defect Management** | ✅ Complete | 6 statuses: `open` → `pending_approval` → `approved`/`rejected` → `work_order_created` → `resolved`. Severity: Low, Medium, High, Critical. |
| **Work Order Kanban** | ✅ Complete | 4 columns: Open → Assigned → In Progress → Completed. Button-based status transitions. |
| **Approval Routing** | ✅ Complete | Supervisor/Plant Manager approval required for severity ≥High or requires work order. |
| **Role-Based Access** | ✅ Complete | 5 roles: Admin, Plant Manager, Supervisor, Inspector, Technician. Route guards + API protection. |
| **Reporting Dashboard** | ✅ Complete | 4 report types: Inspection, Defect, Maintenance, Compliance. Compliance score uses weighted formula: 40% Inspection Timeliness + 35% Critical Defect Resolution + 25% Work Order Flow Health. |
| **Notifications** | ✅ Complete | Polling-based (per PRD §6). See coverage table below. |
| **Audit Log** | ✅ Complete | All state-changing actions logged with user, entity, timestamp, metadata. |
| **Dark Theme** | ✅ Complete | Industrial/professional dark palette. IBM Plex Sans + Mono. shadcn/ui components. |
| **Responsive Layout** | ✅ Complete | Sidebar collapses on mobile. Tables reflow. Forms stack. |

### Notification coverage

| Event | Wired? | Notes |
|---|---|---|
| `defect_created` | ✅ | Fires on POST /api/defects. Pushes to plant manager + supervisor. |
| `defect_critical` | ✅ | Fires when severity is Critical and status is `pending_approval`. |
| `defect_approved` | ✅ | Fires on POST /api/defects/:id/approve. Notifies reporter. |
| `defect_rejected` | ✅ | Fires on POST /api/defects/:id/approve (reject). Notifies reporter. |
| `inspection_due` | ✅ | Fires on POST /api/inspections. Notifies the assigned inspector. |
| `inspection_completed` | ✅ | Fires on POST /api/inspections. Notifies supervisors + plant managers. |
| `work_order_assigned` | ✅ | Fires when a work order is assigned to a technician. |
| `work_order_completed` | ✅ | Fires on work order status transition to `completed`. |
| `approval_required` | ✅ | Fires when a defect enters `pending_approval` (severity ≥High). |
| `inspection_assigned` | ❌ Deferred | Needs supervisor-to-inspector assignment workflow (MVP: inspector self-creates inspections). |
| `inspection_overdue` | ❌ Deferred | Needs a daily cron/scheduler to detect past-due inspections (not built yet). |

---

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

---

## Demo accounts

All accounts use the password `password123`:

| Email | Role | Plant |
|---|---|---|
| `admin@eaop.local` | Administrator | — |
| `plant.manager@eaop.local` | Plant Manager | Pune |
| `supervisor@eaop.local` | Supervisor | Pune |
| `inspector@eaop.local` | Inspector | Pune |
| `technician@eaop.local` | Maintenance Technician | Pune |

---

## Seed data at a glance

- **3 plants:** Pune, Chakan, Nashik
- **20 assets** across 5 types (Hydraulic Press, Conveyor Motor, Air Compressor, Boiler, CNC Machine)
- **5 checklist templates** (one per asset type, 6 items each)
- **7 inspections:** 2 pass, 2 fail, 3 pending
- **8 defects** across all 4 severities and all 6 statuses (including 3 Critical `pending_approval`)
- **5 work orders** in all 4 Kanban columns
- **3 approvals** (2 approved, 1 rejected)
- **10 audit log entries**
- **5 seed notifications** (2 critical, 1 work order assigned, 1 overdue, 1 demo)

---

## Important scope notes (from the reference documents)

- **Single dark theme only** for MVP. Light theme is documented as future scope (TRD §18, DocTokens §21).
- **No drag-and-drop required for Work Order Kanban** — button-based status change is the MVP baseline (FSMOD §10). Drag-and-drop is optional polish.
- **Approval is an action on the Defect Detail screen**, not a separate module (FSMOD §9).
- **Notifications are polling-based**, not real-time (PRD §6).
- **The mock backend is intentionally minimal** — it returns correct seeded data, not a production backend (FSMOD §16). Documented simplifications live in `backend/README.md`.
- **Settings page is an intentional minimal stub** — acceptable per PRD. No persistence; preferences are session-only.
- **E2E QA has been done at the API level only.** A full browser walkthrough of all 5 role journeys has not been executed.

---

## Deployment

### CRITICAL: Uploads environment variable

**Set `VITE_UPLOADS_BASE_URL` to your deployed backend's public URL (e.g. `https://your-backend.railway.app`) in your Vercel project's environment variables before deploying the frontend.** If this is left unset or wrong, all inspection/defect photos will silently fail to load — they'll try to fetch from `localhost:4000`, which won't exist in production.

The mechanism (see `frontend/src/lib/utils.ts`, `toAbsolutePhotoUrl`) prepends this base URL to relative `/uploads/*` paths returned by the backend API. In dev, the built-in default (`http://localhost:4000`) is correct because both servers run on the same machine. In production, the environment variable overrides the default and must point to wherever your backend is deployed.

### Vercel (frontend)

A `vercel.json` at the project root configures SPA routing: all paths that don't match a static file are rewritten to `index.html`, enabling client-side routing. The build command is `npm run build` (outputs to `dist/`).

---

## Project structure references

The full Week 1–6 plan, route map, data model, and design tokens are in the `references/` folder. Any future agent or developer joining the build should start there.