# ADR-004: REST, Not GraphQL

- **Status:** Accepted
- **Date:** 2026-07-13
- **Deciders:** EAOP Development Team

## Context

The EAOP backend exposes an API consumed by a single SPA frontend and
potentially by a future mobile companion app. We evaluated two API
paradigms:

1. **REST (Representational State Transfer)** — resource-oriented
   endpoints (`GET /api/assets`, `POST /api/defects`, etc.) with JSON
   payloads, HTTP status codes, and standard CRUD semantics.
2. **GraphQL** — a single `/graphql` endpoint with a typed schema,
   client-specified field selection, and resolver-based data fetching.

## Decision

We chose **REST** with JSON over HTTP. The backend is an Express 5 server
that exposes ~25 endpoints organized by domain resource (assets, defects,
inspections, work orders, notifications, reports, audit logs, auth, plants).

## Alternatives Considered

| Option | Rejected Because |
|--------|-----------------|
| **GraphQL (Apollo Server)** | Adds a heavy dependency for a known-query workload; the frontend always fetches full resource representations (not partial fields); N+1 resolver performance requires DataLoader batching which adds complexity; overkill for a single-consumer API with ~25 endpoints. |
| **tRPC** | Tightly couples frontend and backend TypeScript types — not viable since the backend is a standalone Express server that may serve non-TypeScript clients in the future. |
| **gRPC** | Binary protocol requires protobuf compilation step; no browser-native support without gRPC-Web proxy; overkill for CRUD-style operations that map naturally to HTTP verbs. |

## Rationale

1. **Standard tooling** — REST is universally understood. Every HTTP client
   (browsers, curl, Postman, Insomnia, Axios, fetch) works out of the box.
2. **Simple caching** — TanStack React Query's built-in cache keying maps
   directly to REST endpoint URLs + query parameters. GraphQL would require
   normalized cache configuration.
3. **Auditability** — Each API call is a distinct HTTP request with a clear
   URL, method, and status code. This maps cleanly to the Audit Log's
   event-driven architecture.
4. **Deployment simplicity** — A single Express process serves the API.
   No GraphQL gateway, schema stitching, or federation required.
5. **Known query patterns** — The frontend always fetches the same resource
   shapes (e.g., Defect List always includes asset name, inspector name,
   status). The "over-fetching" critique of REST doesn't apply because we
   designed the API responses to match exactly what the UI needs.

## Consequences

- **Positive:** Clean separation of concerns — each domain controller
  handles its own CRUD + business logic.
- **Positive:** API is self-documenting via Swagger/OpenAPI (the
  `docs/api/` directory contains a contract for each endpoint).
- **Positive:** No additional infrastructure (GraphQL cache, persisted
  queries, Apollo Studio) required.
- **Negative:** Multiple round-trips for dashboard data (assets count,
  inspections count, defects count, work orders by status) — mitigated by
  the dedicated `/api/reports/dashboard-summary` aggregation endpoint.
- **Negative:** Versioning strategy must be explicit (URL prefix or header)
  if breaking changes are introduced — but for an internal SPA, coordinated
  frontend/backend deployments handle this.