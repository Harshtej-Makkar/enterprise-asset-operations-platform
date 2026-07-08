import { apiClient } from './api-client';
import type { DashboardKpis, DashboardTrends, RecentActivityItem } from '@/types/dashboard';

/**
 * Dashboard service — Week 2 implementation. Wraps the real backend
 * endpoints added in Block 2:
 *   GET /api/dashboard/kpis
 *   GET /api/dashboard/trends
 *   GET /api/dashboard/recent
 */
export const dashboardService = {
  async getKpis(): Promise<DashboardKpis> {
    const { data } = await apiClient.get<DashboardKpis>('/dashboard/kpis');
    return data;
  },

  async getTrends(): Promise<DashboardTrends> {
    const { data } = await apiClient.get<DashboardTrends>('/dashboard/trends');
    return data;
  },

  async getRecent(): Promise<RecentActivityItem[]> {
    const { data } = await apiClient.get<RecentActivityItem[]>('/dashboard/recent');
    return data;
  },
};
