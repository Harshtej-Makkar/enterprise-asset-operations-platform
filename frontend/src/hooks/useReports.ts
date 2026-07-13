import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '@/services/api';
import type { ReportFilter, GeneratedReport } from '@/types/report';

/** List all previously generated reports */
export function useReportList() {
  return useQuery({
    queryKey: ['reports'],
    queryFn: () => reportService.list(),
  });
}

/** Preview a single generated report by ID */
export function useReport(id: string | undefined) {
  return useQuery<GeneratedReport>({
    queryKey: ['reports', id],
    queryFn: () => reportService.get(id as string),
    enabled: !!id,
  });
}

/** Generate a new report */
export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (filter: ReportFilter) => reportService.generate(filter),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}