import { apiClient } from './api-client';
import type { DashboardKpis, RecentActivityItem } from '@/types/dashboard';

/**
 * Dashboard service — stubbed for Week 1.
 * Returns real seeded numbers once the backend KPI endpoint is connected.
 * Per the Implementation Plan, dashboard layout is built now (Week 1/2)
 * even though the values will be near-zero until Weeks 4-5 produce data.
 */
export const dashboardService = {
  async getKpis(): Promise<DashboardKpis> {
    const { data } = await apiClient.get<DashboardKpis>('/dashboard/kpis');
    return data;
  },

  async getRecent(): Promise<RecentActivityItem[]> {
    const { data } = await apiClient.get<RecentActivityItem[]>('/dashboard/recent');
    return data;
  },
};
