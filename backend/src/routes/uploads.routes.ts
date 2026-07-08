import { Router } from 'express';
import { uploadMiddleware, uploadsController } from '../controllers/uploads.controller.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Photo upload router — POST /api/uploads/photo
 *
 * Multipart form-data, single file under the field name "photo".
 * The multer middleware validates MIME type and size; the controller
 * writes the file to disk and returns a public URL.
 */
export const uploadsRouter = Router();
uploadsRouter.post(
  '/photo',
  requireAuth,
  uploadMiddleware,
  (req, res) => uploadsController.uploadPhoto(req, res),
);
