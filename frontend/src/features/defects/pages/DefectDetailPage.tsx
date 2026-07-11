import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useDefect, useApproveDefect, useRejectDefect } from '@/hooks/useDefects';

const APPROVAL_ROLES = new Set(['admin', 'plant_manager', 'supervisor']);

export default function DefectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const defectQuery = useDefect(id);
  const approveMutation = useApproveDefect();
  const rejectMutation = useRejectDefect();

  const [rejectComment, setRejectComment] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  if (defectQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (defectQuery.isError || !defectQuery.data) {
    return (
      <PagePlaceholder
        title="Defect Not Found"
        description="The requested defect could not be loaded."
        week="Week 3"
        bullets={['Check the defect ID', 'Return to the defect list']}
      />
    );
  }

  const defect = defectQuery.data;

  const severityColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const canApprove =
    !!user &&
    APPROVAL_ROLES.has(user.role) &&
    defect.severity === 'critical' &&
    defect.status === 'pending_approval';

  const handleApprove = () => {
    approveMutation.mutate({ id: defect.id });
  };

  const handleReject = () => {
    if (!rejectComment.trim()) return;
    rejectMutation.mutate({ id: defect.id, comment: rejectComment.trim() });
    setShowRejectForm(false);
    setRejectComment('');
  };

  const isApproving = approveMutation.isPending;
  const isRejecting = rejectMutation.isPending;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/defects')}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Defects
      </Button>

      <PageHeader
        title="Defect Detail"
        description={defect.description}
        eyebrow={`Defect ${defect.id.slice(0, 8)}…`}
      />

      {/* Metadata grid */}
      <div className="rounded-sm border border-border-default bg-bg-surface p-5">
        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-caption text-text-secondary">Severity</dt>
            <dd className="mt-0.5">
              <span
                className={`inline-block rounded-sm px-2 py-0.5 text-caption font-medium ${severityColors[defect.severity] ?? 'bg-neutral-100 text-text-secondary'}`}
              >
                {defect.severity}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Status</dt>
            <dd className="mt-0.5 text-body capitalize text-text-primary">
              {defect.status.replace(/_/g, ' ')}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Category</dt>
            <dd className="mt-0.5 text-body text-text-primary">{defect.category}</dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Reported</dt>
            <dd className="mt-0.5 text-body text-text-primary">
              {new Date(defect.createdAt).toLocaleDateString()}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Reporter</dt>
            <dd className="mt-0.5 text-body text-text-primary">
              {defect.reportedBy.slice(0, 8)}…
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Asset</dt>
            <dd className="mt-0.5 text-body text-text-primary">
              <button
                type="button"
                className="underline hover:text-interactive-default"
                onClick={() => navigate(`/assets/${defect.assetId}`)}
              >
                {defect.assetId.slice(0, 8)}…
              </button>
            </dd>
          </div>
          {defect.inspectionId && (
            <div>
              <dt className="text-caption text-text-secondary">Inspection</dt>
              <dd className="mt-0.5 text-body text-text-primary">
                <button
                  type="button"
                  className="underline hover:text-interactive-default"
                  onClick={() => navigate(`/inspections/${defect.inspectionId}`)}
                >
                  {defect.inspectionId.slice(0, 8)}…
                </button>
              </dd>
            </div>
          )}
        </dl>
      </div>

      {/* Description block */}
      <section className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h3 className="mb-2 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Description
        </h3>
        <p className="text-body text-text-primary whitespace-pre-wrap">{defect.description}</p>
      </section>

      {/* Photos (placeholder — photo upload lands later) */}
      {defect.photoUrls.length > 0 && (
        <section className="rounded-sm border border-border-default bg-bg-surface p-5">
          <h3 className="mb-3 font-mono text-caption uppercase tracking-wider text-text-secondary">
            Photos ({defect.photoUrls.length})
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {defect.photoUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Defect photo ${i + 1}`}
                className="aspect-square rounded-sm border border-border-default object-cover"
              />
            ))}
          </div>
        </section>
      )}

      {/* Approval action block */}
      {canApprove && (
        <section className="rounded-sm border-2 border-amber-200 bg-amber-50 p-5">
          <h3 className="mb-3 font-mono text-caption uppercase tracking-wider text-amber-800">
            Approval Required
          </h3>
          <p className="mb-4 text-caption text-amber-700">
            This is a <strong>Critical</strong> defect awaiting your decision. Approving will
            automatically create a Work Order.
          </p>

          {showRejectForm ? (
            <div className="space-y-3">
              <textarea
                placeholder="Reason for rejection (required)…"
                value={rejectComment}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setRejectComment(e.target.value)
                }
                rows={3}
                className="w-full rounded-sm border border-border-default bg-bg-surface-raised px-3 py-2 text-body text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:border-border-focus disabled:cursor-not-allowed disabled:opacity-40"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectComment('');
                  }}
                  disabled={isRejecting}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReject}
                  disabled={isRejecting || !rejectComment.trim()}
                  className="gap-1.5 bg-red-600 text-white hover:bg-red-700"
                >
                  {isRejecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  Confirm Reject
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button
                size="sm"
                onClick={handleApprove}
                disabled={isApproving || isRejecting}
                className="gap-1.5 bg-green-600 text-white hover:bg-green-700"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRejectForm(true)}
                disabled={isApproving || isRejecting}
                className="gap-1.5 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Reject
              </Button>
            </div>
          )}

          {approveMutation.isError && (
            <p className="mt-3 text-caption text-red-600">
              Approval failed: {(approveMutation.error as Error)?.message ?? 'Unknown error'}
            </p>
          )}
          {rejectMutation.isError && (
            <p className="mt-3 text-caption text-red-600">
              Rejection failed: {(rejectMutation.error as Error)?.message ?? 'Unknown error'}
            </p>
          )}
          {approveMutation.isSuccess && (
            <p className="mt-3 text-caption font-medium text-green-700">
              ✓ Defect approved. A Work Order has been created automatically.
            </p>
          )}
          {rejectMutation.isSuccess && (
            <p className="mt-3 text-caption font-medium text-amber-700">
              ✓ Defect rejected. The reporter has been notified.
            </p>
          )}
        </section>
      )}

      {/* Non-critical / already-decided info banner */}
      {!canApprove && defect.severity === 'critical' && defect.status !== 'pending_approval' && (
        <div className="rounded-sm border border-border-default bg-bg-surface p-5">
          <p className="text-caption text-text-secondary">
            This critical defect has already been{' '}
            <span className="font-medium text-text-primary">
              {defect.status.replace(/_/g, ' ')}
            </span>
            .
          </p>
        </div>
      )}
    </div>
  );
}