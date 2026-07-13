import { AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { useAssets, usePlants } from '@/hooks/useAssets';
import { useCreateDefect } from '@/hooks/useDefects';
import { useInspection } from '@/hooks/useInspections';
import type { DefectSeverity } from '@/types/defect';

const SEVERITY_OPTIONS: { value: DefectSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const COMMON_CATEGORIES = [
  'Corrosion',
  'Leak',
  'Crack',
  'Vibration',
  'Noise',
  'Electrical',
  'Instrumentation',
  'Structural',
  'Safety',
  'Other',
];

/**
 * Log Defect page — Week 3 build.
 *
 * Standalone form accessible from /defects/new or linked from
 * InspectionDetailPage with pre-filled asset/inspection via query params.
 * On success, navigates to the new defect's detail page.
 *
 * FSMOD §9 — all roles can log defects (Inspector, Supervisor, Plant Manager, Admin).
 */
export default function LogDefectPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId') ?? '';
  const preselectedInspectionId = searchParams.get('inspectionId') ?? '';

  const [assetId, setAssetId] = useState(preselectedAssetId);
  const [severity, setSeverity] = useState<DefectSeverity | ''>('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const assetsQuery = useAssets({ pageSize: 200 }); // load all for select
  const plantsQuery = usePlants();
  const inspectionQuery = useInspection(preselectedInspectionId || undefined);
  const createMutation = useCreateDefect();

  const assets = assetsQuery.data?.data ?? [];
  const plants = plantsQuery.data?.data ?? [];

  // If navigated from inspection detail, auto-fill asset from inspection data
  useEffect(() => {
    if (!assetId && inspectionQuery.data?.asset?.id) {
      setAssetId(inspectionQuery.data.asset.id);
    }
  }, [assetId, inspectionQuery.data]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!assetId) errs.assetId = 'Asset is required.';
    if (!severity) errs.severity = 'Severity is required.';
    if (!category.trim()) errs.category = 'Category is required.';
    if (!description.trim()) errs.description = 'Description is required.';
    if (description.length > 500) errs.description = 'Max 500 characters.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      const defect = await createMutation.mutateAsync({
        assetId,
        inspectionId: preselectedInspectionId || undefined,
        severity: severity as DefectSeverity,
        category: category.trim(),
        description: description.trim(),
      });
      navigate(`/defects/${defect.id}`);
    } catch {
      // error handled by mutation state
    }
  }

  const [plantFilter, setPlantFilter] = useState('');
  const filteredAssets = plantFilter
    ? assets.filter((a) => a.plantId === plantFilter)
    : assets;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <PageHeader
        title="Log Defect"
        description="Report a new defect found during inspection or routine check."
        eyebrow="Defects"
      />

      {preselectedInspectionId && inspectionQuery.data && (
        <div className="flex items-center gap-2 rounded-sm border border-border-default bg-bg-surface p-3 text-caption text-text-secondary">
          <AlertTriangle className="h-4 w-4 text-accent-signal" />
          Logging defect against inspection ·{' '}
          <span className="font-mono text-text-primary">{inspectionQuery.data.id.slice(0, 8)}…</span>
          {' · '}
          <span className="text-text-primary">
            {inspectionQuery.data.asset?.assetCode} {inspectionQuery.data.asset?.name}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 rounded-sm border border-border-default bg-bg-surface p-5">
        {/* Plant filter + Asset selector */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="plantFilter" className="text-caption text-text-secondary">
              Filter by Plant (optional)
            </label>
            <select
              id="plantFilter"
              value={plantFilter}
              onChange={(e) => setPlantFilter(e.target.value)}
              className="mt-1 w-full min-h-10 rounded-sm border border-border-default bg-bg-surface p-2.5 text-caption text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
            >
              <option value="">All plants</option>
              {plants.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assetId" className="text-caption text-text-secondary">
              Asset <span className="text-status-critical">*</span>
            </label>
            <select
              id="assetId"
              value={assetId}
              onChange={(e) => {
                setAssetId(e.target.value);
                setErrors((prev) => ({ ...prev, assetId: '' }));
              }}
              disabled={!!preselectedAssetId}
              className="mt-1 w-full min-h-10 rounded-sm border border-border-default bg-bg-surface p-2.5 text-caption text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40 disabled:opacity-60"
            >
              <option value="">Select an asset…</option>
              {filteredAssets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetCode} · {a.name}
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="mt-1 text-caption text-status-critical">{errors.assetId}</p>
            )}
          </div>
        </div>

        {/* Severity + Category */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="severity" className="text-caption text-text-secondary">
              Severity <span className="text-status-critical">*</span>
            </label>
            <select
              id="severity"
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value as DefectSeverity);
                setErrors((prev) => ({ ...prev, severity: '' }));
              }}
              className="mt-1 w-full min-h-10 rounded-sm border border-border-default bg-bg-surface p-2.5 text-caption text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
            >
              <option value="">Choose severity…</option>
              {SEVERITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="mt-1 text-caption text-status-critical">{errors.severity}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="text-caption text-text-secondary">
              Category <span className="text-status-critical">*</span>
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((prev) => ({ ...prev, category: '' }));
              }}
              className="mt-1 w-full min-h-10 rounded-sm border border-border-default bg-bg-surface p-2.5 text-caption text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
            >
              <option value="">Choose category…</option>
              {COMMON_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-caption text-status-critical">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-caption text-text-secondary">
            Description <span className="text-status-critical">*</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setErrors((prev) => ({ ...prev, description: '' }));
            }}
            rows={4}
            maxLength={500}
            placeholder="Describe the defect in detail — location, appearance, measurements, etc."
            className="mt-1 w-full min-h-10 rounded-sm border border-border-default bg-bg-surface p-2.5 text-caption text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
          />
          <div className="mt-1 flex justify-between text-caption text-text-secondary">
            <span>
              {errors.description && (
                <span className="text-status-critical">{errors.description}</span>
              )}
            </span>
            <span>{description.length}/500</span>
          </div>
        </div>

        {createMutation.isError && (
          <p className="text-caption text-status-critical">
            {(createMutation.error as Error)?.message ?? 'Failed to create defect.'}
          </p>
        )}

        {severity === 'critical' && (
          <div className="flex items-start gap-2 rounded-sm border border-accent-signal/30 bg-accent-signal/5 p-3 text-caption text-text-secondary">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-accent-signal" />
            <span>
              Critical defects require approval from a Supervisor or Plant Manager before a work
              order is created. The defect will be in <strong>pending approval</strong> status.
            </span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-border-default pt-4">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate(-1)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              'Log Defect'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}