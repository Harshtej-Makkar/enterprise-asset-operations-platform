import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function NotificationsPage() {
  return (
    <PagePlaceholder
      title="Notifications"
      description="Lightweight panel for inspection due/overdue, critical defects, work order events."
      week="Week 6"
      bullets={[
        'Polling-based refresh (no websockets — per PRD §6)',
        'Mark individual notifications as read',
        'Click-through to the linked module',
      ]}
    />
  );
}
