import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function AssetListPage() {
  return (
    <PagePlaceholder
      title="Asset Registry"
      description="All registered industrial assets across plants, with search and filter."
      week="Week 2"
      bullets={[
        'Asset table with search, plant filter, status filter (TanStack Table)',
        'Server-side pagination (mandatory per DMDD §14)',
        'Asset Detail screen with QR code image (generated client-side)',
        'Inspection + defect history per asset',
      ]}
    />
  );
}
