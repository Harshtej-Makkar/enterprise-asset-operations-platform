import { AlertTriangle, ArrowLeft, Check, Loader2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/forms/FileUpload';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { SearchInput } from '@/components/forms/SearchInput';
import { SelectField } from '@/components/forms/SelectField';
import { useAssets } from '@/hooks/useAssets';
import { useChecklistTemplate, useCreateInspection, useUploadPhoto } from '@/hooks/useInspections';
import { cn } from '@/lib/utils';
import type { Asset } from '@/types/asset';

type ItemResult = 'pass' | 'fail' | 'na' | '';

interface ItemState {
  result: ItemResult;
  notes: string;
  photoUrl: string | null;
}

/**
 * New Inspection page (Week 2 build).
 *
 * Two-step flow per the Implementation Plan §4 Week 2 deliverable:
 *   1. Pick an asset (searchable dropdown)
 *   2. Dynamic checklist form, built from the asset's checklist template.
 *      Each item is a Pass/Fail/NA radio set + optional notes + conditional
 *      photo upload (shown only if the item's requiresPhoto is true).
 *
 * Tablet-first per TRD §16 — the layout is designed for 768–1024px
 * (single-column checklist with big touch targets) and degrades to
 * 375px gracefully.
 */
export default function NewInspectionPage() {
  const navigate = useNavigate();

  // Step 1: asset selection
  const [assetSearch, setAssetSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const assetsQuery = useAssets({ search: assetSearch, pageSize: 20 });
  const selectedAsset: Asset | undefined = useMemo(
    () => assetsQuery.data?.data.find((a) => a.id === selectedAssetId),
    [assetsQuery.data, selectedAssetId],
  );

  // Step 2: dynamic checklist (loads once an asset is selected)
  const templateQuery = useChecklistTemplate(selectedAsset?.assetTypeId);
  const [items, setItems] = useState<Record<string, ItemState>>({});
  const [scheduledDate, setScheduledDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10),
  );

  const createMutation = useCreateInspection();
  const uploadMutation = useUploadPhoto();

  const assetOptions = useMemo(
    () => [
      { value: '', label: assetsQuery.isLoading ? 'Loading assets…' : 'Select an asset' },
      ...(assetsQuery.data?.data ?? []).map((a) => ({
        value: a.id,
        label: `${a.assetCode} · ${a.name}`,
      })),
    ],
    [assetsQuery.data, assetsQuery.isLoading],
  );

  const updateItem = (itemId: string, patch: Partial<ItemState>) => {
    setItems((prev) => ({
      ...prev,
      [itemId]: {
        result: prev[itemId]?.result ?? '',
        notes: prev[itemId]?.notes ?? '',
        photoUrl: prev[itemId]?.photoUrl ?? null,
        ...patch,
      },
    }));
  };

  // Build the per-item validation errors. The backend re-validates on
  // submit, but a quick client-side check gives the user immediate
  // feedback.
  const validationErrors = useMemo(() => {
    const errors: Record<string, string> = {};
    if (!templateQuery.data) return errors;
    for (const tplItem of templateQuery.data.items) {
      const state = items[tplItem.id];
      if (!state || !state.result) {
        errors[tplItem.id] = 'Select a result';
        continue;
      }
      if (tplItem.requiresPhoto && !state.photoUrl) {
        errors[tplItem.id] = 'Photo required';
      }
    }
    return errors;
  }, [items, templateQuery.data]);

  const hasAnyAnswer = Object.values(items).some((s) => s.result);
  const canSubmit =
    !!selectedAssetId &&
    !!templateQuery.data &&
    hasAnyAnswer &&
    Object.keys(validationErrors).length === 0 &&
    !createMutation.isPending;

  const handleSubmit = async () => {
    if (!selectedAsset || !templateQuery.data) return;
    const payload = {
      assetId: selectedAsset.id,
      scheduledDate,
      items: templateQuery.data.items.map((tpl) => {
        const state = items[tpl.id] ?? { result: '', notes: '', photoUrl: null };
        return {
          checklistTemplateItemId: tpl.id,
          result: (state.result || 'na') as 'pass' | 'fail' | 'na',
          notes: state.notes.trim() || null,
          photoUrl: state.photoUrl,
        };
      }),
    };
    const created = await createMutation.mutateAsync(payload);
    navigate(`/inspections/${created.id}`);
  };

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/inspections')}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Inspections
      </Button>

      <PageHeader
        title="New Inspection"
        description="Select an asset, then complete the dynamic checklist. Required photos are enforced."
        eyebrow="Inspections"
        actions={
          selectedAssetId ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate(`/defects/new?assetId=${selectedAssetId}`)
              }
              className="gap-1.5"
            >
              <AlertTriangle className="h-4 w-4" /> Log Defect
            </Button>
          ) : undefined
        }
      />

      {/* Step 1 — Asset picker */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h3 className="mb-3 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Step 1 — Select Asset
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SearchInput
            value={assetSearch}
            onChange={setAssetSearch}
            placeholder="Search by code or name…"
          />
          <SelectField
            label="Asset"
            showLabel={false}
            name="asset"
            value={selectedAssetId}
            onChange={(e) => {
              setSelectedAssetId(e.target.value);
              setItems({}); // reset answers when asset changes
            }}
            options={assetOptions}
          />
        </div>
        {selectedAsset && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-caption text-text-secondary sm:grid-cols-4">
            <div>
              <div className="text-text-muted">Plant</div>
              <div className="text-text-primary">{selectedAsset.plantId.slice(0, 8)}…</div>
            </div>
            <div>
              <div className="text-text-muted">Department</div>
              <div className="text-text-primary">{selectedAsset.department ?? '—'}</div>
            </div>
            <div>
              <div className="text-text-muted">Status</div>
              <div className="text-text-primary">{selectedAsset.status}</div>
            </div>
            <div>
              <div className="text-text-muted">Type ID</div>
              <div className="font-mono text-text-primary">{selectedAsset.assetTypeId.slice(0, 8)}…</div>
            </div>
          </div>
        )}
      </section>

      {/* Step 2 — Dynamic checklist */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h3 className="mb-3 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Step 2 — Complete Checklist
        </h3>

        {!selectedAssetId && (
          <p className="text-caption text-text-muted">Select an asset above to load its checklist.</p>
        )}

        {selectedAssetId && templateQuery.isLoading && (
          <div className="flex items-center gap-2 text-caption text-text-secondary">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading checklist…
          </div>
        )}

        {templateQuery.isError && (
          <PagePlaceholder
            title="No checklist template"
            description="This asset's type doesn't have a checklist template configured."
            week=""
            bullets={['Contact an admin to set up the template for this asset type.']}
          />
        )}

        {templateQuery.data && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <label className="text-caption text-text-secondary" htmlFor="scheduled-date">
                Scheduled date
              </label>
              <input
                id="scheduled-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="h-10 rounded-sm border border-border-default bg-bg-surface px-3 font-mono text-caption text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
              />
            </div>

            <ol className="space-y-4">
              {templateQuery.data.items.map((tplItem, idx) => {
                const state = items[tplItem.id] ?? { result: '', notes: '', photoUrl: null };
                const err = validationErrors[tplItem.id];
                return (
                  <li
                    key={tplItem.id}
                    className={cn(
                      'rounded-sm border bg-bg-surface-raised p-4',
                      err ? 'border-status-critical' : 'border-border-default',
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-caption font-mono text-text-secondary">
                          {String(idx + 1).padStart(2, '0')}
                        </p>
                        <p className="mt-0.5 text-body font-medium text-text-primary">
                          {tplItem.label}
                          {tplItem.requiresPhoto && (
                            <span className="ml-2 inline-flex items-center gap-1 text-caption text-accent-signal">
                              <AlertTriangle className="h-3 w-3" /> photo required
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        {(['pass', 'fail', 'na'] as const).map((opt) => {
                          const active = state.result === opt;
                          const tones: Record<typeof opt, string> = {
                            pass: 'border-status-success text-status-success',
                            fail: 'border-status-critical text-status-critical',
                            na: 'border-status-neutral text-status-neutral',
                          };
                          const Icons: Record<typeof opt, typeof Check> = {
                            pass: Check,
                            fail: X,
                            na: AlertTriangle,
                          };
                          const Icon = Icons[opt];
                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => updateItem(tplItem.id, { result: opt })}
                              className={cn(
                                'inline-flex h-9 items-center gap-1.5 rounded-sm border px-3 text-caption font-medium uppercase tracking-wider transition-colors',
                                active
                                  ? tones[opt]
                                  : 'border-border-default text-text-secondary hover:border-border-strong hover:text-text-primary',
                              )}
                              aria-pressed={active}
                            >
                              <Icon className="h-3.5 w-3.5" /> {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label
                          htmlFor={`notes-${tplItem.id}`}
                          className="text-caption text-text-secondary"
                        >
                          Notes (optional)
                        </label>
                        <textarea
                          id={`notes-${tplItem.id}`}
                          value={state.notes}
                          onChange={(e) => updateItem(tplItem.id, { notes: e.target.value })}
                          rows={2}
                          maxLength={500}
                          className="mt-1 w-full rounded-sm border border-border-default bg-bg-surface p-2 text-caption text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40"
                          placeholder="Observations, anomalies, etc."
                        />
                      </div>
                      {tplItem.requiresPhoto && (
                        <div>
                          <FileUpload
                            value={state.photoUrl}
                            onChange={(url) => updateItem(tplItem.id, { photoUrl: url })}
                            isUploading={uploadMutation.isPending}
                            onUpload={async (file) => {
                              const res = await uploadMutation.mutateAsync(file);
                              return res.url;
                            }}
                            label="Photo (required)"
                          />
                        </div>
                      )}
                    </div>

                    {err && <p className="mt-2 text-caption text-status-critical">{err}</p>}
                  </li>
                );
              })}
            </ol>

            {createMutation.isError && (
              <p className="text-caption text-status-critical">
                {(createMutation.error as Error)?.message ?? 'Failed to submit inspection.'}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-border-default pt-4">
              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate('/inspections')}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                  </>
                ) : (
                  'Submit Inspection'
                )}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
