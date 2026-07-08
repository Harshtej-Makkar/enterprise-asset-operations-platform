import type { Request, Response } from 'express';
import {
  runtimeNotifications,
  seedNotifications,
} from '../repositories/memory-store.js';
import type { AuthedRequest } from '../middleware/auth.js';
import type { Notification } from '../types/domain.js';
import { toNotificationDto } from '../mappers/domain-dtos.js';

/**
 * Notifications controller — list, mark-read, mark-all-read.
 *
 * Replaces the Week 1 stub. Backed by the in-memory seed + runtime list,
 * which is fine for a single-process demo backend (per FSMOD §16). The
 * response shape uses the camelCase `toNotificationDto` mapper — never
 * return raw snake_case domain rows.
 *
 * Scoping rule: notifications are scoped to the authenticated user. The
 * seed data targets the supervisor, plant_manager, and technician
 * accounts so the bell badge is interesting for the three demo roles
 * most likely to log in. Admin and inspector see their own (currently
 * empty) inbox.
 *
 * Merge rule: a notification's effective state is the runtime row if
 * one exists for that id, otherwise the seed row. This matters once a
 * user has marked a seed row as read — we copy the seed row into
 * runtime (with read=true) so the change persists, and the seed row
 * itself stays untouched (it's exported as `const`). Without the merge
 * rule, a user could mark a seed row read and a subsequent list call
 * would still see it as unread (the seed is `read=false`).
 */
function effective(): Notification[] {
  const map = new Map<string, Notification>();
  // Seed first, so runtime overrides.
  for (const n of seedNotifications) map.set(n.id, n);
  for (const n of runtimeNotifications) map.set(n.id, n);
  return [...map.values()];
}

function effectiveForUser(userId: string): Notification[] {
  return effective().filter((n) => n.user_id === userId);
}

export const notificationsController = {
  /**
   * GET /api/notifications
   * Query params:
   *   - read  = 'true' | 'false' | undefined (no filter)
   *   - limit = number (defaults to 50, capped at 200)
   *
   * Returns the user's most recent notifications, newest first.
   */
  list(req: AuthedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const userId = req.user.id;

    const readFilter = typeof req.query.read === 'string' ? req.query.read : undefined;
    const limit = clampLimit(req.query.limit);

    const filtered = effectiveForUser(userId).filter((n) => {
      if (readFilter === 'true') return n.read === true;
      if (readFilter === 'false') return n.read === false;
      return true;
    });

    // Newest first.
    filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const slice = filtered.slice(0, limit);

    res.json(slice.map(toNotificationDto));
  },

  /**
   * GET /api/notifications/unread-count
   * Returns just the unread count for the bell badge. Cheaper than
   * fetching the full list and counting client-side.
   */
  unreadCount(req: AuthedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const count = effectiveForUser(req.user.id).filter((n) => n.read === false).length;
    res.json({ count });
  },

  /**
   * PATCH /api/notifications/:id/read
   * Marks a single notification as read. Only the owning user can mark
   * it read (we 404 on a foreign id to avoid leaking existence).
   */
  markRead(req: AuthedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const id = req.params.id;
    const userId = req.user.id;

    const current = effectiveForUser(userId).find((n) => n.id === id);
    if (!current) {
      res.status(404).json({ message: `Notification ${id} not found` });
      return;
    }
    if (current.read) {
      // Already read — return the current DTO (idempotent).
      res.json(toNotificationDto(current));
      return;
    }

    // Promote a copy of the seed row (or update the existing runtime
    // row) with read=true.
    const inRuntime = runtimeNotifications.find((n) => n.id === id);
    if (inRuntime) {
      inRuntime.read = true;
      res.json(toNotificationDto(inRuntime));
      return;
    }
    const promoted: Notification = { ...current, read: true };
    runtimeNotifications.unshift(promoted);
    res.json(toNotificationDto(promoted));
  },

  /**
   * POST /api/notifications/mark-all-read
   * Marks every unread notification for the current user as read in a
   * single call. Returns the number of notifications updated.
   */
  markAllRead(req: AuthedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const userId = req.user.id;
    let count = 0;

    for (const n of effectiveForUser(userId)) {
      if (n.read) continue;

      const inRuntime = runtimeNotifications.find((r) => r.id === n.id);
      if (inRuntime) {
        inRuntime.read = true;
      } else {
        runtimeNotifications.unshift({ ...n, read: true });
      }
      count += 1;
    }

    res.json({ updated: count });
  },
};

function clampLimit(raw: unknown): number {
  const n = Number(raw);
  if (!Number.isFinite(n)) return 50;
  return Math.max(1, Math.min(200, Math.floor(n)));
}
