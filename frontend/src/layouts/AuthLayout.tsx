import { Outlet } from 'react-router-dom';
import { Factory } from 'lucide-react';

/**
 * Authentication layout — used by /login only.
 * Centered card on the dark app background, brand mark above.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-bg-primary p-4">
      <div className="mb-8 flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-accent-signal text-text-inverse">
          <Factory className="h-6 w-6" />
        </div>
        <span className="font-mono text-caption uppercase tracking-[0.2em] text-text-secondary">
          Enterprise Asset Operations Platform
        </span>
      </div>
      <div className="w-full max-w-md rounded-sm border border-border-default bg-bg-surface p-8 shadow-lg">
        <Outlet />
      </div>
      <p className="mt-6 text-caption text-text-muted">
        © {new Date().getFullYear()} EAOP · Internal use only
      </p>
    </div>
  );
}
