import { useNavigate } from 'react-router-dom';
import type { WorkOrder } from '@/types/work-order';

interface KanbanCardProps {
  workOrder: WorkOrder;
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'bg-red-100 text-red-800 border-l-red-500',
  high: 'bg-orange-100 text-orange-800 border-l-orange-500',
  medium: 'bg-yellow-100 text-yellow-800 border-l-yellow-500',
  low: 'bg-green-100 text-green-800 border-l-green-500',
};

export function KanbanCard({ workOrder }: KanbanCardProps) {
  const navigate = useNavigate();
  const priorityColor = PRIORITY_COLORS[workOrder.priority] ?? PRIORITY_COLORS.low;

  return (
    <button
      type="button"
      onClick={() => navigate(`/work-orders/${workOrder.id}`)}
      className={`w-full cursor-pointer rounded-sm border border-border-default bg-bg-surface p-3 text-left transition-shadow hover:shadow-sm border-l-4 ${priorityColor}`}
    >
      <div className="mb-1 flex items-start justify-between gap-2">
        <p className="text-caption font-medium text-text-primary line-clamp-2">
          {workOrder.defect?.description ?? 'Unknown defect'}
        </p>
      </div>

      {workOrder.defect && (
        <div className="mb-2 flex flex-wrap gap-1">
          <span className="inline-block rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
            {workOrder.defect.severity}
          </span>
          <span className="inline-block rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[10px] text-text-secondary">
            {workOrder.defect.category}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-text-muted">
        <span>
          {workOrder.assigneeName ?? 'Unassigned'}
        </span>
        <span>{new Date(workOrder.createdAt).toLocaleDateString()}</span>
      </div>

      {workOrder.deadline && (
        <div className="mt-1 text-[10px] text-text-muted">
          Deadline: {new Date(workOrder.deadline).toLocaleDateString()}
        </div>
      )}
    </button>
  );
}