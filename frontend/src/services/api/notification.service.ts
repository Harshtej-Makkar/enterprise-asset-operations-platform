import { apiClient } from './api-client';
import type { Notification } from '@/types/notification';

/**
 * Notification service.
 *
 * Polling-based refresh; no websockets (per PRD §6).
 *
 * Endpoints:
 *   GET    /notifications?read=true|false&limit=N
 *   GET    /notifications/unread-count
 *   PATCH  /notifications/:id/read
 *   POST   /notifications/mark-all-read
 */
export const notificationService = {
  async list(params?: { read?: 'true' | 'false'; limit?: number }): Promise<Notification[]> {
    const { data } = await apiClient.get<Notification[]>('/notifications', { params });
    return data;
  },

  async unreadCount(): Promise<{ count: number }> {
    const { data } = await apiClient.get<{ count: number }>('/notifications/unread-count');
    return data;
  },

  async markRead(id: string): Promise<Notification> {
    const { data } = await apiClient.patch<Notification>(`/notifications/${id}/read`);
    return data;
  },

  async markAllRead(): Promise<{ updated: number }> {
    const { data } = await apiClient.post<{ updated: number }>('/notifications/mark-all-read');
    return data;
  },
};
