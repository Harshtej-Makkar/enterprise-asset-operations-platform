import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function InspectionListPage() {
  return (
    <PagePlaceholder
      title="Inspections"
      description="All scheduled, in-progress, and completed inspections."
      week="Week 2"
      bullets={[
        'Inspection list with status + due date filters',
        'Tablet-first layout for shop-floor use (per TRD §16)',
        'Per-inspector scope for Inspector role; full visibility for Supervisor/Manager',
      ]}
    />
  );
}
