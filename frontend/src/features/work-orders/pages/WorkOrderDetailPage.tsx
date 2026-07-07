import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { useParams } from 'react-router-dom';

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  return (
    <PagePlaceholder
      title="Work Order Detail"
      description={`Work order ${id ?? '—'} — defect context, technician, priority, deadline, completion notes.`}
      week="Week 4"
      bullets={[
        'Linked defect (severity, description, photos)',
        'Assigned technician + status change controls',
        'Maintenance update log',
        'Completion notes + sign-off when status = Completed',
      ]}
    />
  );
}
