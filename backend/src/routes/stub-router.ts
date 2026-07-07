import { Router, type Request, type Response, type NextFunction } from 'express';

/**
 * Create a "stub" Express router for a Week 1 module.
 *
 * The route exists in the router map so the frontend's service layer
 * can call it without 404s / connection errors. Every hit responds with
 * `501 Not Implemented` and emits a one-line console warning so it's
 * obvious during testing which endpoints are still stubs versus
 * fully wired (per project narrative — the backend is a frontend
 * dev convenience, FSMOD §16).
 *
 * When a real implementation lands in a later week, the corresponding
 * `src/routes/<module>.routes.ts` and `src/controllers/<module>.controller.ts`
 * files are replaced, and this stub is deleted.
 *
 * Usage:
 *   export const assetsRouter = createStubRouter('assets');
 *   app.use('/api/assets', assetsRouter);
 */
export function createStubRouter(moduleName: string): Router {
  const router = Router();

  router.all('/*', (req: Request, res: Response, _next: NextFunction) => {
    console.warn(
      `[stub] ${moduleName}: ${req.method} ${req.originalUrl} → 501 (not yet implemented — see Implementation Plan)`,
    );
    res.status(501).json({
      message: `The ${moduleName} module is not implemented yet.`,
      module: moduleName,
      method: req.method,
      path: req.originalUrl,
    });
  });

  return router;
}
