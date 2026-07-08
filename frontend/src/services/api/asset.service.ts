import { apiClient } from './api-client';
import type { Asset, AssetDetail } from '@/types/asset';
import type { Defect } from '@/types/defect';
import type { Inspection } from '@/types/inspection';
import type { PaginatedResponse } from '@/types/common';
import type { Plant } from '@/types/user';

/**
 * Plant record returned by GET /api/plants. Used as the value of the
 * plant filter on the Asset List page.
 */
export interface PlantListResponse {
  data: Plant[];
  total: number;
}

/**
 * Asset service — Week 2 implementation. Wraps the real backend
 * endpoints added in Block 2:
 *   GET  /api/assets
 *   GET  /api/assets/:id
 *   GET  /api/assets/:id/inspections
 *   GET  /api/assets/:id/defects
 *
 * Plus the supporting taxonomy lookup:
 *   GET  /api/plants
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

  /**
   * Inspection history for one asset. Not paginated — the asset detail
   * page shows the full list in a compact table.
   */
  async getInspections(id: string): Promise<{ data: Inspection[]; total: number }> {
    const { data } = await apiClient.get<{ data: Inspection[]; total: number }>(
      `/assets/${id}/inspections`,
    );
    return data;
  },

  /**
   * Defect history for one asset. Not paginated.
   */
  async getDefects(id: string): Promise<{ data: Defect[]; total: number }> {
    const { data } = await apiClient.get<{ data: Defect[]; total: number }>(
      `/assets/${id}/defects`,
    );
    return data;
  },

  /**
   * Plant list — drives the filter dropdown on the Asset List page.
   */
  async getPlants(): Promise<PlantListResponse> {
    const { data } = await apiClient.get<PlantListResponse>('/plants');
    return data;
  },
};
