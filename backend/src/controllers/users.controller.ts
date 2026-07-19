import bcrypt from 'bcryptjs';
import type { Response } from 'express';
import { seedUsers } from '../repositories/memory-store.js';
import type { AuthedRequest } from '../middleware/auth.js';

/**
 * Users controller — profile, password, preferences.
 *
 * All three endpoints mutate the in-memory seedUsers array directly
 * (the objects inside the const array are mutable JS objects). This
 * is intentional for the demo backend — no persistence layer exists
 * by design (FSMOD §16).
 */

function findAuthedUser(req: AuthedRequest) {
  if (!req.user) return { status: 401 as const, json: { message: 'Not authenticated' } };
  const user = seedUsers.find((u) => u.id === req.user!.id);
  if (!user) return { status: 404 as const, json: { message: 'User not found' } };
  return { status: 200 as const, user };
}

function toProfileDto(u: typeof seedUsers[number]) {
  return {
    id: u.id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    plantId: u.plant_id,
    status: u.status,
    preferences: u.preferences ?? { email_notifications: true },
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export const usersController = {
  /**
   * PATCH /api/users/me
   * Body: { fullName?: string }
   *
   * Updates the display name of the authenticated user. The updated
   * record is mutated in-place in the in-memory seedUsers array.
   */
  updateProfile(req: AuthedRequest, res: Response): void {
    const result = findAuthedUser(req);
    if ('json' in result) {
      res.status(result.status).json(result.json);
      return;
    }
    const { user } = result;
    const { fullName } = req.body as { fullName?: string };

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length === 0) {
        res.status(400).json({ message: 'fullName must be a non-empty string' });
        return;
      }
      user.full_name = fullName.trim();
      user.updated_at = new Date().toISOString();
    }

    res.json(toProfileDto(user));
  },

  /**
   * PATCH /api/users/me/password
   * Body: { currentPassword: string, newPassword: string }
   *
   * Verifies the current password against the stored bcrypt hash,
   * then hashes and stores the new password. Both bcrypt operations
   * are async for consistency — no sync calls in request handlers.
   */
  async changePassword(req: AuthedRequest, res: Response): Promise<void> {
    const result = findAuthedUser(req);
    if ('json' in result) {
      res.status(result.status).json(result.json);
      return;
    }
    const { user } = result;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: 'currentPassword and newPassword are required' });
      return;
    }
    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      res.status(400).json({ message: 'newPassword must be at least 6 characters' });
      return;
    }

    const ok = await bcrypt.compare(currentPassword, user.password_hash);
    if (!ok) {
      res.status(401).json({ message: 'Current password is incorrect' });
      return;
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.updated_at = new Date().toISOString();

    res.json({ message: 'Password updated' });
  },

  /**
   * PATCH /api/users/me/preferences
   * Body: { emailNotifications?: boolean }
   *
   * Merges the provided preferences into the user record. The
   * notification-creation code in defects/inspections/work-orders
   * controllers checks this flag before pushing a notification.
   */
  updatePreferences(req: AuthedRequest, res: Response): void {
    const result = findAuthedUser(req);
    if ('json' in result) {
      res.status(result.status).json(result.json);
      return;
    }
    const { user } = result;
    const { emailNotifications } = req.body as { emailNotifications?: boolean };

    if (emailNotifications !== undefined) {
      if (typeof emailNotifications !== 'boolean') {
        res.status(400).json({ message: 'emailNotifications must be a boolean' });
        return;
      }
      user.preferences = { ...user.preferences, email_notifications: emailNotifications };
      user.updated_at = new Date().toISOString();
    }

    res.json({ preferences: user.preferences ?? { email_notifications: true } });
  },
};