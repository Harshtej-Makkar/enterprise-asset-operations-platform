import { apiClient } from './api-client';
import type { ReportFilter, ReportListItem, GeneratedReport } from '@/types/report';

/**
 * Report service — Week 5 implementation.
 * Endpoints per API Contract §16:
 *   GET    /reports          → list previously generated reports
 *   POST   /reports/generate → generate a new report
 *   GET    /reports/:id       → preview a generated report
 *   GET    /reports/:id/export?format=csv → CSV download
 */
export const reportService = {
  /** List previously generated reports */
  async list(): Promise<{ data: ReportListItem[]; total: number }> {
    const { data } = await apiClient.get<{ data: ReportListItem[]; total: number }>('/reports');
    return data;
  },

  /** Generate a new report */
  async generate(filter: ReportFilter): Promise<GeneratedReport> {
    const { data } = await apiClient.post<GeneratedReport>('/reports/generate', filter);
    return data;
  },

  /** Preview a generated report */
  async get(id: string): Promise<GeneratedReport> {
    const { data } = await apiClient.get<GeneratedReport>(`/reports/${id}`);
    return data;
  },

  /** Export CSV */
  async exportCsv(id: string): Promise<Blob> {
    const { data } = await apiClient.get<Blob>(`/reports/${id}/export`, {
      params: { format: 'csv' },
      responseType: 'blob',
    });
    return data;
  },
};