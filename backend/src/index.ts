import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { dashboardRouter } from './routes/dashboard.routes.js';
import { assetsRouter } from './routes/assets.routes.js';
import { inspectionsRouter } from './routes/inspections.routes.js';
import { defectsRouter } from './routes/defects.routes.js';
import { workOrdersRouter } from './routes/work-orders.routes.js';
import { reportsRouter } from './routes/reports.routes.js';
import { notificationsRouter } from './routes/notifications.routes.js';
import { auditRouter } from './routes/audit.routes.js';

/**
 * EAOP Mock/Stub Backend — application entrypoint.
 *
 * The frontend talks to this server in development (Vite proxies /api to
 * PORT). This layer is intentionally minimal (FSMOD §16) — it returns
 * seed data correctly, issues JWTs, and provides the routes the frontend
 * needs to demo. It is not a production backend.
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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'eaop-backend', mode: env.databaseUrl ? 'postgres' : 'in-memory' });
});

app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);

// Module routers — all currently return 501 + console.warn via stub-router.ts.
// Replaced week-by-week per the Implementation Plan.
app.use('/api/assets', assetsRouter);
app.use('/api/inspections', inspectionsRouter);
app.use('/api/defects', defectsRouter);
app.use('/api/work-orders', workOrdersRouter);
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
  console.log(`Mode: ${env.databaseUrl ? 'PostgreSQL' : 'in-memory (no DATABASE_URL set)'}`);
});
