# EAOP — Database

PostgreSQL 14+ schema and seed data, implementing `08-Data-Model-Database-Design.md`.

## Files

- `schema/001-schema.sql` — DDL for all 15 core tables (per DMDD §3). UUID primary keys, snake_case columns, foreign keys, CHECK constraints on enums, indexes on the columns DMDD §8 specifies.
- `seed/seed.sql` — Idempotent seed data per DMDD §15: 3 plants, 20 assets across 5 types, 1 checklist template per type (6 items each, ≥1 with `requires_photo: true`), inspections in pass/fail/pending/overdue states, defects across all 4 severities and all 6 statuses (including 3 Critical `pending_approval`), work orders in all 4 Kanban columns, audit logs and notifications.
- `erd/` — Reserved for the ER diagram export (Week 6, Implementation Plan).

## Applying locally

```bash
createdb eaop
psql eaop -f schema/001-schema.sql
psql eaop -f seed/seed.sql
```

The seed is idempotent (`ON CONFLICT DO NOTHING` everywhere) so re-running it is safe.

## Demo accounts (all password `password123`)

| Email | Role | Plant |
|---|---|---|
| `admin@eaop.local` | admin | — |
| `plant.manager@eaop.local` | plant_manager | Pune |
| `supervisor@eaop.local` | supervisor | Pune |
| `inspector@eaop.local` | inspector | Pune |
| `technician@eaop.local` | technician | Pune |

> Note: the seed inserts pre-computed bcrypt hashes. If you need to regenerate them, run `node -e "console.log(require('bcryptjs').hashSync('password123', 10))"` and update the `users` rows.
