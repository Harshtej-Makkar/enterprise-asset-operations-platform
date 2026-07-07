import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { useParams } from 'react-router-dom';

export default function InspectionDetailPage() {
  const { id } = useParams();
  return (
    <PagePlaceholder
      title="Inspection Detail"
      description={`Inspection ${id ?? '—'} — execution view, item-by-item checklist.`}
      week="Week 2"
      bullets={[
        'Tablet-first responsive layout (TRD §16)',
        'Per-item pass/fail + notes + photo',
        'Submit + idempotent guard (DMDD §10)',
      ]}
    />
  );
}
