import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function AuditLogPage() {
  return (
    <PagePlaceholder
      title="Audit Log"
      description="Read-only chronological timeline of state-changing actions across the platform."
      week="Week 6"
      bullets={[
        'Filter by entity type, user, and date range',
        'Click-through to the related entity (defect, work order, inspection, …)',
        'Reads from the same action log that powers Notifications — no separate logging system',
      ]}
    />
  );
}
