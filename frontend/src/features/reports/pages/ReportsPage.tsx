import { PagePlaceholder } from '@/components/common/PagePlaceholder';

export default function ReportsPage() {
  return (
    <PagePlaceholder
      title="Reports"
      description="Operational reports across inspections, defects, maintenance, and compliance."
      week="Week 5"
      bullets={[
        'Report type picker (Inspection / Defect / Maintenance / Compliance)',
        'Filters: date range, plant, severity, status',
        'CSV export (required); PDF export (stretch goal)',
      ]}
    />
  );
}
