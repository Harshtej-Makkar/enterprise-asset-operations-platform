import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { useParams } from 'react-router-dom';

export default function DefectDetailPage() {
  const { id } = useParams();
  return (
    <PagePlaceholder
      title="Defect Detail"
      description={`Defect ${id ?? '—'} — full context plus the Approve/Reject action for Critical severity.`}
      week="Week 3"
      bullets={[
        'Severity badge, status, photos, description, reporter',
        'Approval action block (visible only to Supervisor/Plant Manager roles, only for Critical severity)',
        'On approval: work order auto-created — surface a redirect to the Kanban board',
        'On rejection: comment required, defect returned to Inspector',
      ]}
    />
  );
}
