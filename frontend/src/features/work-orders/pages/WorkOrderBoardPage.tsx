import { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { KanbanColumn } from '../components/KanbanColumn';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import type { WorkOrder, WorkOrderStatus } from '@/types/work-order';

const COLUMNS: { status: WorkOrderStatus; title: string }[] = [
  { status: 'open', title: 'Open' },
  { status: 'assigned', title: 'Assigned' },
  { status: 'in_progress', title: 'In Progress' },
  { status: 'completed', title: 'Completed' },
];

/**
 * Work Order Board (Kanban) — Week 4 build.
 *
 * Displays all work orders in a 4-column Kanban board.
 * Each card shows: title (defect description), priority, asset, assigned technician.
 * Clicking a card navigates to the Work Order Detail page.
 *
 * The board is horizontally scrollable on smaller viewports.
 */
export default function WorkOrderBoardPage() {
  const workOrdersQuery = useWorkOrders();

  const workOrders = workOrdersQuery.data?.data ?? [];
  const total = workOrdersQuery.data?.total ?? 0;

  const grouped = useMemo(() => {
    const map: Record<WorkOrderStatus, WorkOrder[]> = {
      open: [],
      assigned: [],
      in_progress: [],
      completed: [],
    };
    for (const wo of workOrders) {
      if (map[wo.status]) {
        map[wo.status].push(wo);
      }
    }
    return map;
  }, [workOrders]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Work Order Board"
        description={`${total} work ${total === 1 ? 'order' : 'orders'} across all statuses.`}
        eyebrow="Work Orders"
      />

      {workOrdersQuery.isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-body text-text-muted">Loading work orders…</p>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              status={col.status}
              count={grouped[col.status].length}
              workOrders={grouped[col.status]}
              emptyMessage={`No ${col.title.toLowerCase()} work orders.`}
            />
          ))}
        </div>
      )}
    </div>
  );
}