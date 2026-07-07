import { apiClient } from './api-client';
import type { Notification } from '@/types/notification';

/**
 * Notification service — stub for Week 1. Real implementation lands in Week 6.
 * Polling-based; no websockets (per PRD §6 Notifications).
 */
export const notificationService = {
  async list(): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>('/notifications');
    return data;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },
};
