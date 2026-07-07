import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Public hook facade for the auth context.
 * Components import from `@/hooks/useAuth`, not directly from the context.
 */
export function useAuth() {
  return useAuthContext();
}
