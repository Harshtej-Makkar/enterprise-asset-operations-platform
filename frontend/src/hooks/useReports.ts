import { useQuery } from '@tanstack/react-query';
import { reportService } from '@/services/api';
import type { ReportFilter } from '@/types/report';

export function useReport(filter: ReportFilter | null) {
  return useQuery({
    queryKey: ['reports', filter],
    queryFn: () => reportService.run(filter as ReportFilter),
    enabled: !!filter,
  });
}
