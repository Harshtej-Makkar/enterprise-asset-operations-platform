import { apiClient } from './api-client';
import type { Defect, Approval } from '@/types/defect';
import type { PaginatedResponse } from '@/types/common';

/**
 * Defect service — Week 3 real implementation.
 *
 * Includes the approval endpoint per FSMOD §9 (approval is an action on the
 * defect, not a separate module).
 */
export const defectService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    severity?: string;
    status?: string;
    plantId?: string;
  }): Promise<PaginatedResponse<Defect>> {
    const { data } = await apiClient.get<PaginatedResponse<Defect>>('/defects', { params });
    return data;
  },

  async get(id: string): Promise<Defect> {
    const { data } = await apiClient.get<Defect>(`/defects/${id}`);
    return data;
  },

  async create(payload: {
    assetId: string;
    inspectionId?: string;
    severity: string;
    category: string;
    description: string;
    photoUrls?: string[];
  }): Promise<Defect> {
    const { data } = await apiClient.post<Defect>('/defects', payload);
    return data;
  },

  async approve(id: string, payload: { comment?: string }): Promise<Approval> {
    const { data } = await apiClient.post<Approval>(`/defects/${id}/approval`, {
      decision: 'approved',
      comment: payload.comment,
    });
    return data;
  },

  async reject(id: string, payload: { comment?: string }): Promise<Approval> {
    const { data } = await apiClient.post<Approval>(`/defects/${id}/approval`, {
      decision: 'rejected',
      comment: payload.comment,
    });
    return data;
  },
};