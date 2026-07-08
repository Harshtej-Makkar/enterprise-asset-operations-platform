import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inspectionService, type ChecklistTemplateResponse, type CreateInspectionPayload, type InspectionItemResponse } from '@/services/api/inspection.service';
import type { Inspection } from '@/types/inspection';

export function useInspections(params?: {
  page?: number;
  pageSize?: number;
  assetId?: string;
  status?: string;
  from?: string;
  to?: string;
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

export function useInspectionItems(id: string | undefined) {
  return useQuery<{ data: InspectionItemResponse[]; total: number }>({
    queryKey: ['inspections', id, 'items'],
    queryFn: () => inspectionService.getItems(id as string),
    enabled: !!id,
  });
}

export function useChecklistTemplate(assetTypeId: string | undefined) {
  return useQuery<ChecklistTemplateResponse>({
    queryKey: ['checklist-template', assetTypeId],
    queryFn: () => inspectionService.getChecklistTemplate(assetTypeId as string),
    enabled: !!assetTypeId,
    staleTime: 5 * 60 * 1000, // templates rarely change
  });
}

/**
 * Create inspection mutation. On success, invalidates the inspections
 * list query, the new inspection's detail query (just in case), the
 * parent asset's history (so the Asset Detail inspection table updates),
 * and the dashboard KPIs (so the count of inspections changes).
 */
export function useCreateInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateInspectionPayload) => inspectionService.create(payload),
    onSuccess: (inspection) => {
      qc.invalidateQueries({ queryKey: ['inspections'] });
      qc.invalidateQueries({ queryKey: ['inspections', inspection.id] });
      qc.invalidateQueries({ queryKey: ['assets', inspection.assetId, 'inspections'] });
      qc.invalidateQueries({ queryKey: ['assets', inspection.assetId] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'trends'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'recent'] });
    },
  });
}

/**
 * Photo upload mutation. Wraps the multipart upload to /api/uploads/photo
 * and returns the public URL to attach to a checklist item's photoUrl.
 */
export function useUploadPhoto() {
  return useMutation({
    mutationFn: (file: File) => inspectionService.uploadPhoto(file),
  });
}
