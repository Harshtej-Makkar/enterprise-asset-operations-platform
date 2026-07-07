import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { useParams } from 'react-router-dom';

export default function AssetDetailPage() {
  const { id } = useParams();
  return (
    <PagePlaceholder
      title="Asset Detail"
      description={`Detail view for asset ${id ?? '—'}.`}
      week="Week 2"
      bullets={[
        'General info, generated QR code image, status',
        'Inspection history list',
        'Defect history list',
        'Linked work orders',
      ]}
    />
  );
}
