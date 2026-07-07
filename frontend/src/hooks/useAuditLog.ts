import { useQuery } from '@tanstack/react-query';
import { auditService } from '@/services/api';

export function useAuditLog(params?: {
  page?: number;
  pageSize?: number;
  entityType?: string;
  userId?: string;
}) {
  return useQuery({
    queryKey: ['audit-log', params ?? {}],
    queryFn: () => auditService.list(params),
  });
}
