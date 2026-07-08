import { apiClient } from './api-client';
import type { AssetType } from '@/types/asset';
import type { Inspection } from '@/types/inspection';
import type { PaginatedResponse } from '@/types/common';

/**
 * Checklist template record returned by GET /api/inspections/asset-types/:id/checklist-template.
 * Drives the dynamic inspection form (DMDD §5 — schema-driven per asset type).
 */
export interface ChecklistTemplateResponse {
  id: string;
  assetTypeId: string;
  name: string;
  items: Array<{
    id: string;
    label: string;
    orderIndex: number;
    requiresPhoto: boolean;
  }>;
}

/**
 * Per-item result row for one inspection item, joined with the checklist
 * template's label and the requiresPhoto flag (so the detail page can
 * render a "photo required" indicator without a second round-trip).
 */
export interface InspectionItemResponse {
  id: string;
  checklistTemplateItemId: string;
  label: string;
  requiresPhoto: boolean;
  result: 'pass' | 'fail' | 'na';
  notes: string | null;
  photoUrl: string | null;
}

export interface CreateInspectionPayload {
  assetId: string;
  scheduledDate: string; // YYYY-MM-DD
  items: Array<{
    checklistTemplateItemId: string;
    result: 'pass' | 'fail' | 'na';
    notes?: string | null;
    photoUrl?: string | null;
  }>;
}

export interface UploadPhotoResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

/**
 * Inspection service — Week 2 implementation.
 *
 * Wraps the real backend endpoints added in Block 2:
 *   GET  /api/inspections
 *   GET  /api/inspections/:id
 *   GET  /api/inspections/:id/items
 *   GET  /api/inspections/asset-types/:id/checklist-template
 *   POST /api/inspections
 *
 * Plus the photo upload + asset-type lookup that the New Inspection
 * page needs:
 *   POST /api/uploads/photo (multipart/form-data, field "photo")
 *   GET  /api/asset-types
 */
export const inspectionService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    assetId?: string;
    status?: string;
    from?: string;
    to?: string;
  }): Promise<PaginatedResponse<Inspection>> {
    const { data } = await apiClient.get<PaginatedResponse<Inspection>>('/inspections', { params });
    return data;
  },

  async get(id: string): Promise<Inspection> {
    const { data } = await apiClient.get<Inspection>(`/inspections/${id}`);
    return data;
  },

  async getItems(id: string): Promise<{ data: InspectionItemResponse[]; total: number }> {
    const { data } = await apiClient.get<{ data: InspectionItemResponse[]; total: number }>(
      `/inspections/${id}/items`,
    );
    return data;
  },

  async getChecklistTemplate(assetTypeId: string): Promise<ChecklistTemplateResponse> {
    const { data } = await apiClient.get<ChecklistTemplateResponse>(
      `/inspections/asset-types/${assetTypeId}/checklist-template`,
    );
    return data;
  },

  async create(payload: CreateInspectionPayload): Promise<Inspection> {
    const { data } = await apiClient.post<Inspection>('/inspections', payload);
    return data;
  },

  /**
   * Upload a single image file. Returns the public URL to attach to
   * a checklist item's `photoUrl` field on submit.
   */
  async uploadPhoto(file: File): Promise<UploadPhotoResponse> {
    const form = new FormData();
    form.append('photo', file);
    const { data } = await apiClient.post<UploadPhotoResponse>('/uploads/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  /**
   * List of asset types — used to derive the asset-type filter on the
   * new-inspection flow when an asset is selected (so the checklist
   * template can be fetched).
   */
  async getAssetTypes(): Promise<{ data: AssetType[]; total: number }> {
    const { data } = await apiClient.get<{ data: AssetType[]; total: number }>('/asset-types');
    return data;
  },
};
