import { useQuery } from '@tanstack/react-query';
import { auditService, type AuditLogActor } from '@/services/api';

export interface AuditLogFilters {
  page?: number;
  pageSize?: number;
  entityType?: string;
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
}

export const AUDIT_LOG_KEY = ['audit-log'] as const;

/**
 * Hook: paginated audit log, with filterable entityType, userId, action,
 * and from/to. Newest first.
 */
export function useAuditLog(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: [...AUDIT_LOG_KEY, 'list', filters ?? {}],
    queryFn: () => auditService.list(filters),
  });
}

/** Hook: distinct action strings, for the action filter dropdown. */
export function useAuditActions() {
  return useQuery({
    queryKey: [...AUDIT_LOG_KEY, 'actions'],
    queryFn: () => auditService.actions(),
    staleTime: 5 * 60 * 1000,
  });
}

/** Hook: users + event counts, for the user filter dropdown. */
export function useAuditUsers() {
  return useQuery({
    queryKey: [...AUDIT_LOG_KEY, 'users'],
    queryFn: () => auditService.users(),
    staleTime: 5 * 60 * 1000,
  });
}

export type { AuditLogActor };
