import bcrypt from 'bcryptjs';
import type { Request, Response } from 'express';
import { seedUsers } from '../repositories/memory-store.js';
import { signJwt } from '../middleware/auth.js';
import type { AuthedRequest } from '../middleware/auth.js';

/**
 * Auth controller — POST /api/auth/login, GET /api/auth/me
 *
 * Validates credentials against the in-memory seed user table and issues
 * a signed JWT. The flow is intentionally simple and documented as such
 * in the backend README (FSMOD §16).
 */
export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ message: 'email and password are required' });
      return;
    }
    const user = seedUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
    const token = signJwt({ id: user.id, email: user.email, role: user.role, fullName: user.full_name });
    res.json({
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        plantId: user.plant_id,
        status: user.status,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  },

  me(req: AuthedRequest, res: Response): void {
    if (!req.user) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }
    const u = seedUsers.find((x) => x.id === req.user!.id);
    if (!u) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    res.json({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      plantId: u.plant_id,
      status: u.status,
      createdAt: u.created_at,
      updatedAt: u.updated_at,
    });
  },
};
