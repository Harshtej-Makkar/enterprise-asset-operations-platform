import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { workOrderService } from '@/services/api';
import type { WorkOrderStatus } from '@/types/work-order';

export function useWorkOrders(params?: {
  page?: number;
  pageSize?: number;
  status?: WorkOrderStatus;
}) {
  return useQuery({
    queryKey: ['work-orders', params ?? {}],
    queryFn: () => workOrderService.list(params),
  });
}

export function useWorkOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['work-orders', id],
    queryFn: () => workOrderService.get(id as string),
    enabled: !!id,
  });
}

export function useChangeWorkOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: WorkOrderStatus }) =>
      workOrderService.changeStatus(id, status),
    onSuccess: (data, vars) => {
      qc.setQueryData(['work-orders', vars.id], data);
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['dashboard', 'kpis'] });
    },
  });
}

export function useAssignWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      workOrderService.assign(id, technicianId),
    onSuccess: (data, vars) => {
      qc.setQueryData(['work-orders', vars.id], data);
      qc.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}

export function useAddWorkOrderNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      note,
      statusChangeTo,
    }: {
      id: string;
      note: string;
      statusChangeTo?: WorkOrderStatus | null;
    }) => workOrderService.addNote(id, { note, statusChangeTo }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['work-orders', vars.id] });
      qc.invalidateQueries({ queryKey: ['work-orders'] });
    },
  });
}