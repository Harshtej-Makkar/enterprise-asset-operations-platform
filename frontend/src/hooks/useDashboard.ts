import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/api';

export function useDashboardKpis() {
  return useQuery({
    queryKey: ['dashboard', 'kpis'],
    queryFn: () => dashboardService.getKpis(),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: ['dashboard', 'recent'],
    queryFn: () => dashboardService.getRecent(),
  });
}
