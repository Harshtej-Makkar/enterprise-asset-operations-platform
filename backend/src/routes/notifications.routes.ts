import { Router } from 'express';
import { notificationsController } from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Notifications router — replaces the Week 1 stub.
 *
 * Routes:
 *   GET    /                       → paginated list of the current user's notifications
 *   GET    /unread-count           → bell-badge count only
 *   PATCH  /:id/read               → mark a single notification as read
 *   POST   /mark-all-read          → mark all of the current user's notifications as read
 *
 * The `:id/read` and `mark-all-read` routes are declared before the
 * catch-all behaviour (there isn't one here — we don't have GET /:id)
 * so order doesn't strictly matter, but it keeps the file readable.
 */
export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get('/', (req, res) =>
  notificationsController.list(req as never, res),
);
notificationsRouter.get('/unread-count', (req, res) =>
  notificationsController.unreadCount(req as never, res),
);
notificationsRouter.post('/mark-all-read', (req, res) =>
  notificationsController.markAllRead(req as never, res),
);
notificationsRouter.patch('/:id/read', (req, res) =>
  notificationsController.markRead(req as never, res),
);
