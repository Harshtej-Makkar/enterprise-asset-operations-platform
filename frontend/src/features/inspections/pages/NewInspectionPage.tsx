import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function NewInspectionPage() {
  return (
    <PagePlaceholder
      title="New Inspection"
      description="Start a new inspection by selecting an asset. Checklist loads dynamically based on the asset's type."
      week="Week 2"
      bullets={[
        'Asset picker (search by code or name)',
        'Dynamic checklist form — schema-driven per asset type (DMDD §5)',
        'Pass/Fail/NA per item, with required photo when requires_photo is true',
        'Submit action creates the inspection record; failed items can trigger a "Log Defect" inline',
      ]}
    />
  );
}
