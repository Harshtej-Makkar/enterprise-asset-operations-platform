import { apiClient } from './api-client';
import type { WorkOrder, WorkOrderDetail, WorkOrderStatus } from '@/types/work-order';
import type { PaginatedResponse } from '@/types/common';

/**
 * Work Order service — Week 4 real implementation.
 * Status change is button-based per FSMOD §10 (drag-and-drop optional polish).
 */
export const workOrderService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    status?: string;
    priority?: string;
    plantId?: string;
  }): Promise<PaginatedResponse<WorkOrder>> {
    const { data } = await apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders', {
      params,
    });
    return data;
  },

  async get(id: string): Promise<WorkOrderDetail> {
    const { data } = await apiClient.get<WorkOrderDetail>(`/work-orders/${id}`);
    return data;
  },

  async changeStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${id}/status`, { status });
    return data;
  },

  async assign(id: string, technicianId: string): Promise<WorkOrder> {
    const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${id}/assign`, {
      technicianId,
    });
    return data;
  },

  async addNote(
    id: string,
    payload: { note: string; statusChangeTo?: WorkOrderStatus | null },
  ): Promise<{
    id: string;
    technicianId: string;
    technicianName: string | null;
    note: string;
    statusChangeTo: WorkOrderStatus | null;
    createdAt: string;
  }> {
    const { data } = await apiClient.post<{
      id: string;
      technicianId: string;
      technicianName: string | null;
      note: string;
      statusChangeTo: WorkOrderStatus | null;
      createdAt: string;
    }>(`/work-orders/${id}/notes`, payload);
    return data;
  },
};