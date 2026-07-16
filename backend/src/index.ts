import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import path from 'node:path';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { assetsRouter } from './routes/assets.routes.js';
import { inspectionsRouter } from './routes/inspections.routes.js';
import { plantsRouter, assetTypesRouter } from './routes/taxonomy.routes.js';
import { uploadsRouter } from './routes/uploads.routes.js';
import { defectsRouter } from './routes/defects.routes.js';
import { workOrdersRouter } from './routes/work-orders.routes.js';
import { usersRouter } from './routes/users.routes.js';
import { reportsRouter } from './routes/reports.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { auditRouter } from './routes/audit.routes.js';
import { seedAssets } from './repositories/memory-store.js';
import type { Asset } from './types/domain.js';

/**
 * EAOP Mock/Stub Backend — application entrypoint.
 *
 * The frontend talks to this server in development (Vite proxies /api to
 * PORT). This layer is intentionally minimal (FSMOD §16) — it returns
 * seed data correctly, issues JWTs, and provides the routes the frontend
 * needs to demo. It is not a production backend.
 *
 * The runtime data stores are attached to the Express app via `app.set`
 * so that controllers (which receive a Request) can read/write them
 * without needing module-level mutable state. This keeps each route
 * testable and avoids cross-request state confusion.
 */
const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

// Lightweight request log (skipped in test env)
if (env.nodeEnv !== 'test') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Register the asset store (seed + runtime) on the app. For now the only
// source of truth is the seed; future asset creation will append here.
app.set('assets', [...seedAssets] as Asset[]);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'eaop-backend',
    mode: 'in-memory',
    databaseUrlConfigured: Boolean(env.databaseUrl),
  });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

app.use('/api/assets', assetsRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/plants', plantsRouter);
app.use('/api/asset-types', assetTypesRouter);
app.use('/api/uploads', uploadsRouter);

// Serve uploaded photos from the local `uploads/` directory. The multer
// controller writes files there and returns a `/uploads/<filename>` URL;
// this static handler makes those URLs addressable from the browser.
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '1h' }));

// Module routers still in stub mode (Week 3+ work).
app.use('/api/defects', defectsRouter);
app.use('/api/work-orders', workOrdersRouter);
app.use('/api/users', usersRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/audit-log', auditRouter);

// Centralised error handler — last in the chain
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[error]', err);
  res.status(500).json({ message: err.message ?? 'Internal server error' });
});

app.listen(env.port, () => {
  console.log(`EAOP backend listening on http://localhost:${env.port}`);
  console.log(
    `Mode: in-memory (MVP)${env.databaseUrl ? ' — DATABASE_URL is set but not yet wired' : ''}`,
  );
});
