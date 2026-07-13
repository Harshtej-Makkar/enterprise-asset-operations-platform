import type { WorkOrder } from '@/types/work-order';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  title: string;
  status: string;
  count: number;
  workOrders: WorkOrder[];
  emptyMessage?: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: 'bg-neutral-100 text-text-secondary',
  assigned: 'bg-status-info/10 text-status-info',
  in_progress: 'bg-status-warning/10 text-status-warning',
  completed: 'bg-status-success/10 text-status-success',
};

export function KanbanColumn({
  title,
  status,
  count,
  workOrders,
  emptyMessage = 'No work orders in this column.',
}: KanbanColumnProps) {
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.open;

  return (
    <div className="flex min-w-[240px] flex-col rounded-sm border border-border-default bg-neutral-50/50">
      <div className="flex items-center justify-between border-b border-border-default px-3 py-2.5">
        <h3 className="text-caption font-semibold text-text-primary">{title}</h3>
        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}>
          {count}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
        {workOrders.length === 0 ? (
          <p className="px-2 py-4 text-center text-caption text-text-muted">{emptyMessage}</p>
        ) : (
          workOrders.map((wo) => <KanbanCard key={wo.id} workOrder={wo} />)
        )}
      </div>
    </div>
  );
}