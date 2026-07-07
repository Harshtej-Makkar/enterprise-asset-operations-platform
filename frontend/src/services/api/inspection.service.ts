import { apiClient } from './api-client';
import type { Inspection } from '@/types/inspection';
import type { PaginatedResponse } from '@/types/common';

/**
 * Inspection service — stub for Week 1. Real implementation lands in Week 2.
 */
export const inspectionService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    assetId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Inspection>> {
    const { data } = await apiClient.get<PaginatedResponse<Inspection>>('/inspections', {
      params,
    });
    return data;
  },

  async get(id: string): Promise<Inspection> {
    const { data } = await apiClient.get<Inspection>(`/inspections/${id}`);
    return data;
  },
};
