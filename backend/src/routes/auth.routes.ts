import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => authController.login(req, res));
authRouter.get('/me', requireAuth, (req: AuthedRequest, res) => authController.me(req, res));
