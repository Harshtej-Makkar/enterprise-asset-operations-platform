import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { seedUsers } from '../repositories/memory-store.js';

/**
 * Simplified JWT middleware.
 *
 * Verifies the `Authorization: Bearer <token>` header, looks the user up
 * in the in-memory seed store, and attaches it to `req.user`. This is
 * documented as a demo flow per FSMOD §16 — a production backend would
 * use httpOnly cookies + refresh token rotation.
 */

export interface AuthedRequest extends Request {
  user?: { id: string; role: string; email: string; fullName: string };
}

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  name: string;
}

export function signJwt(user: { id: string; email: string; role: string; fullName: string }): string {
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, name: user.fullName };
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn } as jwt.SignOptions);
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    res.status(401).json({ message: 'Missing or invalid Authorization header' });
    return;
  }
  const token = header.slice(7).trim();
  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    const user = seedUsers.find((u) => u.id === decoded.sub);
    if (!user) {
      res.status(401).json({ message: 'User no longer exists' });
      return;
    }
    req.user = { id: user.id, role: user.role, email: user.email, fullName: user.full_name };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}
