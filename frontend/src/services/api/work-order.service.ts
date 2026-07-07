import { apiClient } from './api-client';
import type { WorkOrder, WorkOrderStatus } from '@/types/work-order';
import type { PaginatedResponse } from '@/types/common';

/**
 * Work Order service — stub for Week 1. Real implementation lands in Week 4.
 * Status change is button-based per FSMOD §10 (drag-and-drop optional polish).
 */
export const workOrderService = {
  async list(params?: {
    page?: number;
    pageSize?: number;
    status?: WorkOrderStatus;
  }): Promise<PaginatedResponse<WorkOrder>> {
    const { data } = await apiClient.get<PaginatedResponse<WorkOrder>>('/work-orders', {
      params,
    });
    return data;
  },

  async get(id: string): Promise<WorkOrder> {
    const { data } = await apiClient.get<WorkOrder>(`/work-orders/${id}`);
    return data;
  },

  async changeStatus(id: string, status: WorkOrderStatus): Promise<WorkOrder> {
    const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${id}/status`, { status });
    return data;
  },

  async assign(id: string, userId: string): Promise<WorkOrder> {
    const { data } = await apiClient.patch<WorkOrder>(`/work-orders/${id}/assign`, {
      userId,
    });
    return data;
  },
};
