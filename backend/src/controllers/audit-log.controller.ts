import type { Request, Response } from 'express';
import {
  allAuditLogs,
  seedUsers,
} from '../repositories/memory-store.js';
import type { AuditLog } from '../types/domain.js';
import { toAuditLogDto } from '../mappers/domain-dtos.js';

/**
 * Audit log controller — paginated, filterable read path.
 *
 * Replaces the Week 1 stub. Backed by the in-memory seed + runtime list
 * (the same store that POST /api/inspections already writes into for
 * inspection_submitted events). Read-only — there is no POST / PATCH /
 * DELETE on the audit log; new entries are written by the relevant
 * controllers as a side effect of their state-changing operations.
 *
 * Sort order: newest first (created_at desc). Filters:
 *   - entityType: 'inspection' | 'defect' | 'work_order' | 'asset' | 'user'
 *   - userId:     the actor's user id
 *   - action:     exact match (e.g. 'inspection_submitted')
 *   - from / to:  inclusive date range on created_at (yyyy-mm-dd)
 *   - page, pageSize
 */
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const VALID_ENTITY_TYPES = new Set([
  'inspection',
  'defect',
  'approval',
  'work_order',
  'asset',
  'user',
]);

function parseIntParam(value: unknown, fallback: number, min = 1, max = Infinity): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function datePrefix(d: string): string {
  // Truncate a datetime to yyyy-mm-dd for >= / <= comparisons.
  return d.slice(0, 10);
}

export const auditLogController = {
  /**
   * GET /api/audit-log
   */
  list(req: Request, res: Response): void {
    const page = parseIntParam(req.query.page, 0, 0);
    const pageSize = parseIntParam(req.query.pageSize, DEFAULT_PAGE_SIZE, 1, MAX_PAGE_SIZE);
    const entityType = typeof req.query.entityType === 'string' ? req.query.entityType : undefined;
    const userId = typeof req.query.userId === 'string' ? req.query.userId : undefined;
    const action = typeof req.query.action === 'string' ? req.query.action : undefined;
    const from = typeof req.query.from === 'string' ? req.query.from : undefined;
    const to = typeof req.query.to === 'string' ? req.query.to : undefined;

    let rows: AuditLog[] = allAuditLogs().slice();

    if (entityType) {
      if (!VALID_ENTITY_TYPES.has(entityType)) {
        res.status(400).json({
          message: `Invalid entityType "${entityType}". Allowed: ${[...VALID_ENTITY_TYPES].join(', ')}`,
        });
        return;
      }
      rows = rows.filter((r) => r.entity_type === entityType);
    }
    if (userId) rows = rows.filter((r) => r.user_id === userId);
    if (action) rows = rows.filter((r) => r.action === action);
    if (from) rows = rows.filter((r) => datePrefix(r.created_at) >= from);
    if (to) rows = rows.filter((r) => datePrefix(r.created_at) <= to);

    // Newest first.
    rows.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const total = rows.length;
    const start = page * pageSize;
    const slice = rows.slice(start, start + pageSize);

    res.json({
      data: slice.map(toAuditLogDto),
      total,
      page,
      pageSize,
    });
  },

  /**
   * GET /api/audit-log/actions
   * Returns the distinct list of action strings currently in the log.
   * Used by the Audit Log page's "action" filter dropdown.
   */
  actions(_req: Request, res: Response): void {
    const set = new Set<string>();
    for (const row of allAuditLogs()) set.add(row.action);
    res.json([...set].sort());
  },

  /**
   * GET /api/audit-log/users
   * Returns the list of users that appear as actors in the log. Used
   * to populate the "user" filter dropdown. Always includes the
   * full user list (so the dropdown shows "no events for this user"
   * if applicable) but flagged with the count.
   */
  users(_req: Request, res: Response): void {
    const counts = new Map<string, number>();
    for (const row of allAuditLogs()) {
      counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1);
    }
    const out = seedUsers
      .map((u) => ({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        role: u.role,
        eventCount: counts.get(u.id) ?? 0,
      }))
      .sort((a, b) => a.fullName.localeCompare(b.fullName));
    res.json(out);
  },
};
