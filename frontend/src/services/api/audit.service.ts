import { apiClient } from './api-client';
import type { AuditLog } from '@/types/audit-log';
import type { PaginatedResponse } from '@/types/common';

/**
 * Audit log service — stub for Week 1. Real implementation lands in Week 6.
 * Read-only timeline; reuses the same action log that Notifications reads.
 */
export const auditService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    entityType?: string;
    userId?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-log', { params });
    return data;
  },
};
