import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import type { Request, Response } from 'express';
import multer, { type FileFilterCallback } from 'multer';

/**
 * Photo upload controller — POST /api/uploads/photo
 *
 * Persists a single image to the local `uploads/` folder (sibling of
 * `src/`) and returns the public URL the frontend can use as a photoUrl
 * on a checklist item.
 *
 * Simplification note (FSMOD §16): in production this would write to
 * S3 / R2 / similar and return a CDN URL. The shape of the response
 * is the same (a URL), so the frontend code is unchanged when we
 * upgrade the storage layer.
 */

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

function fileFilter(_req: Request, file: Express.Multer.File, cb: FileFilterCallback) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    cb(new Error(`Unsupported MIME type: ${file.mimetype}. Allowed: jpeg, png, webp.`));
    return;
  }
  cb(null, true);
}

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single('photo');

export const uploadsController = {
  /**
   * POST /api/uploads/photo
   * Multipart form-data, field name "photo"
   * Returns: { url: string, filename: string, size: number, mimetype: string }
   */
  uploadPhoto(req: Request, res: Response): void {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded under field "photo"' });
      return;
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({
      url,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  },
};
