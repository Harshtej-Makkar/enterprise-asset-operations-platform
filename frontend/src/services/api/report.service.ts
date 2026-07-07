import { apiClient } from './api-client';
import type { ReportFilter } from '@/types/report';

/**
 * Report service — stub for Week 1. Real implementation lands in Week 5.
 * CSV export is required; PDF is stretch goal.
 */
export const reportService = {
  async run(filter: ReportFilter): Promise<unknown[]> {
    const { data } = await apiClient.post<unknown[]>('/reports/run', filter);
    return data;
  },

  async exportCsv(filter: ReportFilter): Promise<Blob> {
    const { data } = await apiClient.post<Blob>('/reports/export', filter, {
      responseType: 'blob',
    });
    return data;
  },
};
