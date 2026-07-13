import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/api/user.service';
import type { UserRole } from '@/types/user';

/**
 * Hook: fetch users, optionally filtered by role.
 *
 * Used by the Work Order Detail page technician assignment dropdown
 * and the Defect Detail page reporter lookup.
 */
export function useUsers(role?: UserRole) {
  return useQuery({
    queryKey: ['users', { role }],
    queryFn: () => userService.list(role ? { role } : undefined),
    staleTime: 5 * 60 * 1000, // users are static in-memory seed data
  });
}