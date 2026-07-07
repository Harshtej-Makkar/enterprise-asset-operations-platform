import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function DefectListPage() {
  return (
    <PagePlaceholder
      title="Defects"
      description="All logged defects, with severity, status, and approval state filters."
      week="Week 3"
      bullets={[
        'Severity filter (low / medium / high / critical)',
        'Status filter (open, pending_approval, approved, rejected, work_order_created, resolved)',
        'Plant filter',
        'Quick link to approval action for Critical defects awaiting approval',
      ]}
    />
  );
}
