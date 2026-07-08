import { apiClient } from './api-client';
import type { AuditLog } from '@/types/audit-log';
import type { PaginatedResponse } from '@/types/common';

export interface AuditLogActor {
  id: string;
  fullName: string;
  email: string;
  role: string;
  eventCount: number;
}

export const auditService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    entityType?: string;
    userId?: string;
    action?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<AuditLog>> {
    const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/audit-log', { params });
    return data;
  },

  async actions(): Promise<string[]> {
    const { data } = await apiClient.get<string[]>('/audit-log/actions');
    return data;
  },

  async users(): Promise<AuditLogActor[]> {
    const { data } = await apiClient.get<AuditLogActor[]>('/audit-log/users');
    return data;
  },
};
