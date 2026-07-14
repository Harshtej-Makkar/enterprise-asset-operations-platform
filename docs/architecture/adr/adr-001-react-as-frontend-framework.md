# ADR-001: React as Frontend Framework

- **Status:** Accepted
- **Date:** 2026-07-13
- **Deciders:** EAOP Development Team

## Context

The Enterprise Asset Operations Platform (EAOP) requires a single-page
application (SPA) that supports:

1. Role-based dashboards for 5 user roles (Admin, Plant Manager,
   Supervisor, Inspector, Technician)
2. Complex form interactions — dynamic checklists, photo uploads,
   multi-step inspection workflows
3. Real-time Kanban board for work order management
4. Client-side routing with lazy-loaded feature modules
5. Reusable component library with consistent design tokens

## Decision

We selected **React 19** with **Vite** as the build tool, using:

- **React Router v6** for client-side routing
- **TanStack React Query** for server-state management and caching
- **Tailwind CSS** for utility-first styling with design tokens from
  `reference/13-Design-Tokens-Specification.md`
- **shadcn/ui** primitives (Radix UI) for accessible, composable components
- **Recharts** for dashboard charting
- **react-dropzone** for photo uploads

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| **Vue 3** | Smaller NPM ecosystem for enterprise component libraries (shadcn/ui, Radix equivalents are less mature); team familiarity favors React. |
| **Angular** | Heavier framework with steeper learning curve; overkill for a 20-page SPA with mostly CRUD + forms. |
| **Svelte** | Growing but niche ecosystem; fewer pre-built UI primitives for enterprise admin panels. |
| **Next.js** | SSR adds deployment complexity (node server required); EAOP is a pure SPA behind an API gateway — no SEO or SSR benefit. |

## Rationale

1. **React 19** introduces the new `use()` hook, server components support,
   and improved hydration — the project is well-positioned to adopt these
   incrementally.
2. **Vite** provides sub-second HMR, fast builds, and built-in env variable
   handling (`VITE_` prefix) — critical for the `VITE_UPLOADS_BASE_URL`
   production configuration.
3. **TanStack React Query** eliminates manual loading/error/refetch
   boilerplate that plagues vanilla `useEffect` + `fetch` approaches.
4. **Tailwind + shadcn/ui** gives us full control over the visual language
   without fighting opinionated component libraries. Design tokens from the
   reference docs map directly to Tailwind config.

## Consequences

- **Positive:** Consistent component API across all 9 feature modules.
- **Positive:** Strong TypeScript integration throughout the stack.
- **Negative:** ~1.1 MB production JS bundle (mostly Lucide icons + Recharts);
  may need code splitting if bundle size becomes a concern.
- **Negative:** React 19 is relatively new (stable April 2025); some ecosystem
  packages may lag in compatibility.