import { Router } from 'express';
import { seedUsers } from '../repositories/memory-store.js';
import { requireAuth } from '../middleware/auth.js';
import { usersController } from '../controllers/users.controller.js';

/**
 * Users endpoint — lightweight lookup used by:
 *   - Technician assignment dropdown on Work Order Detail page
 *   - Defect reporter name resolution (optional)
 *
 * GET /api/users?role=technician
 */
export const usersRouter = Router();

usersRouter.get('/', requireAuth, (req, res) => {
  const role = typeof req.query.role === 'string' ? req.query.role : undefined;
  let users = seedUsers.map((u) => ({
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    plantId: u.plant_id,
    status: u.status,
  }));
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  res.json({ data: users, total: users.length });
});

usersRouter.patch('/me', requireAuth, (req, res) => usersController.updateProfile(req as any, res));
usersRouter.patch('/me/password', requireAuth, (req, res) => usersController.changePassword(req as any, res));
usersRouter.patch('/me/preferences', requireAuth, (req, res) => usersController.updatePreferences(req as any, res));
