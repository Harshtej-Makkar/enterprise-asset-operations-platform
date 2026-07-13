import { Router } from 'express';
import { workOrdersController } from '../controllers/work-orders.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const workOrdersRouter = Router();

// All routes require authentication
workOrdersRouter.use(requireAuth);

workOrdersRouter.get('/', workOrdersController.list);
workOrdersRouter.get('/:id', workOrdersController.get);
workOrdersRouter.patch('/:id/status', workOrdersController.updateStatus);
workOrdersRouter.patch('/:id/assign', workOrdersController.assign);
workOrdersRouter.post('/:id/notes', workOrdersController.addNote);
