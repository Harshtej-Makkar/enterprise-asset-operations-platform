import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Standard shadcn/ui classname helper.
 * Merges Tailwind class lists with conflict resolution.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format an ISO date string for display in the UI.
 * Used by tables, audit log timeline, work order deadlines, etc.
 *
 * Renders as dd/mm/yyyy (en-GB locale with 2-digit month). The single
 * source of truth for date formatting across the app — every page that
 * shows a date imports this from @/lib/utils.
 */
export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Compact dd/mm for chart X-axis labels and other space-constrained
 * contexts. No year (e.g. "08/07"). Falls back to the dash sentinel
 * for null/invalid input, matching formatDate.
 */
export function formatDateShort(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
  });
}

/**
 * Format a datetime with time component, for the audit log etc.
 * Renders as dd/mm/yyyy, HH:MM (en-GB locale with 2-digit month).
 */
export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return '—';
  const d = typeof iso === 'string' ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Absolute base URL for photo assets served by the backend.
 *
 * The backend stores uploaded images under `/uploads/*` and the API
 * returns the relative path in JSON (e.g. `/uploads/abc.png`).
 * In dev, the Vite server only proxies `/api/*` to the backend — it
 * does NOT proxy `/uploads/*` — so a relative URL would resolve to
 * the frontend dev server (404). We prefix the relative URL with the
 * backend's origin so the browser hits the right server.
 *
 * The default targets the local backend on :4000. Override in
 * production via `VITE_UPLOADS_BASE_URL` (e.g.
 * `https://eaop-backend.railway.app`). If the URL is already absolute
 * (`http://...` or `https://...`), it's returned unchanged.
 */
const UPLOADS_BASE_URL =
  (import.meta.env.VITE_UPLOADS_BASE_URL as string | undefined) ??
  'http://localhost:4000';

/**
 * Convert a photo URL returned by the backend (always relative, e.g.
 * `/uploads/abc.png`) into an absolute URL the browser can fetch.
 * Pass-through for null/undefined/empty so callers can use it
 * defensively on the value-with-default pattern.
 */
export function toAbsolutePhotoUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // Already absolute (http/https/data/blob) — use as-is
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  // Make sure exactly one slash joins the base and the path
  const base = UPLOADS_BASE_URL.replace(/\/$/, '');
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

/**
 * Localized-storage helpers for the simplified JWT auth flow.
 * The mock backend issues a JWT; the frontend persists it in localStorage
 * (documented as a simplification — see FSMOD §16).
 */
const TOKEN_KEY = 'eaop.auth.token';
const USER_KEY = 'eaop.auth.user';

export const authStorage = {
  getToken(): string | null {
    try {
      return window.localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string): void {
    try {
      window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
      // localStorage unavailable — ignore in this simplified flow
    }
  },
  getUser<T = unknown>(): T | null {
    try {
      const raw = window.localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  setUser(user: unknown): void {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // ignore
    }
  },
  clear(): void {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // ignore
    }
  },
};
