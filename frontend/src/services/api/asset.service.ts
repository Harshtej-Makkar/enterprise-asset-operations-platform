import { apiClient } from './api-client';
import type { Asset, AssetDetail } from '@/types/asset';
import type { PaginatedResponse } from '@/types/common';

/**
 * Asset service — stub for Week 1. Real implementation lands in Week 2.
 */
export const assetService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    plantId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Asset>> {
    const { data } = await apiClient.get<PaginatedResponse<Asset>>('/assets', { params });
    return data;
  },

  async get(id: string): Promise<AssetDetail> {
    const { data } = await apiClient.get<AssetDetail>(`/assets/${id}`);
    return data;
  },
};
