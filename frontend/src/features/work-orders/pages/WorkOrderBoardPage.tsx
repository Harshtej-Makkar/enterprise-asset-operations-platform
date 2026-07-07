import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function WorkOrderBoardPage() {
  return (
    <PagePlaceholder
      title="Work Orders"
      description="Kanban board for work orders generated from approved / non-critical defects."
      week="Week 4"
      bullets={[
        'Four columns: Open → Assigned → In Progress → Completed',
        'Button-based status change as the baseline (FSMOD §10)',
        'Drag-and-drop optional polish (dnd-kit) if time allows',
        "No work orders yet — they'll appear here once a defect is approved"
      ]}
    />
  );
}
