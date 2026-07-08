import { Router } from 'express';
import { auditLogController } from '../controllers/audit-log.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Audit log router — replaces the Week 1 stub.
 *
 * Routes:
 *   GET  /            → paginated, filterable list (entityType, userId, action, from, to)
 *   GET  /actions     → distinct list of action strings (for the filter dropdown)
 *   GET  /users       → list of users with event counts (for the filter dropdown)
 *
 * The `actions` and `users` routes are declared before any future
 * `/:id` route so Express doesn't try to match a literal segment as
 * an id. (We don't have GET /:id today, but it's a good habit.)
 */
export const auditRouter = Router();

auditRouter.use(requireAuth);

auditRouter.get('/actions', (req, res) => auditLogController.actions(req, res));
auditRouter.get('/users', (req, res) => auditLogController.users(req, res));
auditRouter.get('/', (req, res) => auditLogController.list(req, res));
