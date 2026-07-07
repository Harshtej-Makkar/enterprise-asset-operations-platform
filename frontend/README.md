# EAOP — Frontend

React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui.

## Scripts

```bash
npm install
npm run dev         # Vite dev server, http://localhost:5173
npm run build       # tsc + vite build
npm run preview     # preview the production build
npm run typecheck   # tsc --noEmit
```

## Architecture

Feature-based organization per `15-Repository-Structure-Specification.md`:

```
frontend/src/
├── app/         (App entry, providers wiring)
├── components/  (shared UI: ui/, layout/, navigation/, common/)
├── features/    (one folder per module: dashboard, assets, inspections, defects, work-orders, reports, notifications, audit, settings)
├── contexts/    (AuthContext)
├── hooks/       (useAuth, useAssets, useDefects, …)
├── layouts/     (AppShell, AuthLayout)
├── pages/       (route-level shells: Login, NotFound)
├── routes/      (AppRouter, ProtectedRoute, PublicOnlyRoute)
├── services/    (api/ — one service per module, plus the axios client)
├── styles/      (globals.css with design tokens)
├── types/       (one file per domain entity)
├── constants/   (nav items, role labels)
├── validation/  (Zod schemas)
└── lib/         (utils, authStorage)
```

All 9 feature folders are present from Day 1 — see `references/15-Repository-Structure-Specification.md` and the Implementation Plan Week 1.

## Design tokens

Tokens live in `tailwind.config.ts` (Tailwind theme extension) and `src/styles/globals.css` (CSS variables). They implement `13-Design-Tokens-Specification.md` exactly — IBM Plex Sans/Mono, the dark industrial palette (signature amber `#F5A623`, status colours, no 16px+ radii). No hardcoded hex values in component code.

## Auth

Simplified JWT flow, documented as such in `09-Frontend-Scope-Module-Ownership.md` §16. Login → JWT in localStorage → `Authorization: Bearer` interceptor on every request. 401 responses clear the token and redirect to `/login`.
