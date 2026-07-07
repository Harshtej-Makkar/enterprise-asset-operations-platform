import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defectService } from '@/services/api';
import type { Defect } from '@/types/defect';

export function useDefects(params?: {
  page?: number;
  pageSize?: number;
  severity?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['defects', params ?? {}],
    queryFn: () => defectService.list(params),
  });
}

export function useDefect(id: string | undefined) {
  return useQuery<Defect>({
    queryKey: ['defects', id],
    queryFn: () => defectService.get(id as string),
    enabled: !!id,
  });
}

export function useApproveDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      defectService.approve(id, { comment }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['defects', vars.id] });
      qc.invalidateQueries({ queryKey: ['defects'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
    },
  });
}

export function useRejectDefect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      defectService.reject(id, { comment }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['defects', vars.id] });
      qc.invalidateQueries({ queryKey: ['defects'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
    },
  });
}
