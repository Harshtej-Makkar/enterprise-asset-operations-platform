import { useQuery } from '@tanstack/react-query';
import { inspectionService } from '@/services/api';
import type { Inspection } from '@/types/inspection';

export function useInspections(params?: {
  page?: number;
  pageSize?: number;
  assetId?: string;
  status?: string;
}) {
  return useQuery({
    queryKey: ['inspections', params ?? {}],
    queryFn: () => inspectionService.list(params),
  });
}

export function useInspection(id: string | undefined) {
  return useQuery<Inspection>({
    queryKey: ['inspections', id],
    queryFn: () => inspectionService.get(id as string),
    enabled: !!id,
  });
}
