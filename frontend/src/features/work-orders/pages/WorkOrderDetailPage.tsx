import { ArrowLeft, Clock, MapPin, User, Wrench } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { PagePlaceholder } from '@/components/common/PagePlaceholder';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import {
  useWorkOrder,
  useChangeWorkOrderStatus,
  useAssignWorkOrder,
  useAddWorkOrderNote,
  useUsers,
} from '@/hooks';
import { formatDateTime } from '@/lib/utils';
import type { WorkOrderStatus } from '@/types/work-order';

const STATUS_LABELS: Record<WorkOrderStatus, string> = {
  open: 'Open',
  assigned: 'Assigned',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_FLOW: Record<WorkOrderStatus, WorkOrderStatus | null> = {
  open: 'assigned',
  assigned: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-neutral-100 text-text-secondary',
  medium: 'bg-status-info/10 text-status-info',
  high: 'bg-status-warning/10 text-status-warning',
  urgent: 'bg-status-error/10 text-status-error',
};

/**
 * Work Order Detail page — Week 4 build.
 *
 * Displays full work order details:
 *   - Summary: defect description, asset, plant, priority, deadline
 *   - Status advancement button (open→assigned via assign, then
 *     assigned→in_progress, in_progress→completed)
 *   - Technician assignment dropdown (only when status is "open")
 *   - Maintenance notes timeline with add-note form
 */
export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const woQuery = useWorkOrder(id);
  const changeStatus = useChangeWorkOrderStatus();
  const assign = useAssignWorkOrder();
  const addNote = useAddWorkOrderNote();
  const techniciansQuery = useUsers('technician');

  const [noteText, setNoteText] = useState('');
  const [advanceOnNote, setAdvanceOnNote] = useState(false);
  const [assignId, setAssignId] = useState('');

  if (woQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Loading work order…" eyebrow="Work Orders" />
      </div>
    );
  }

  if (woQuery.isError || !woQuery.data) {
    return (
      <PagePlaceholder
        title="Work Order Not Found"
        description={`No work order with id ${id ?? '—'} could be loaded.`}
        week=""
        bullets={['Check the URL and try again.']}
      />
    );
  }

  const wo = woQuery.data;
  const nextStatus = STATUS_FLOW[wo.status];
  const technicians = techniciansQuery.data?.data ?? [];

  async function handleAssign() {
    if (!assignId) return;
    try {
      await assign.mutateAsync({ id: wo.id, technicianId: assignId });
    } catch {
      // error rendered by mutation state
    }
  }

  async function handleAdvanceStatus() {
    if (!nextStatus) return;
    try {
      await changeStatus.mutateAsync({ id: wo.id, status: nextStatus });
    } catch {
      // error rendered by mutation state
    }
  }

  async function handleAddNote() {
    if (!noteText.trim()) return;
    try {
      await addNote.mutateAsync({
        id: wo.id,
        note: noteText.trim(),
        statusChangeTo: advanceOnNote ? nextStatus : null,
      });
      setNoteText('');
      setAdvanceOnNote(false);
    } catch {
      // error rendered by mutation state
    }
  }

  const isMutating = changeStatus.isPending || assign.isPending || addNote.isPending;

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/work-orders')}
        className="gap-1.5"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Board
      </Button>

      <PageHeader
        title={wo.defect?.description ?? 'Work Order'}
        description={wo.id}
        eyebrow="Work Order Detail"
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={wo.status} />
          </div>
        }
      />

      {/* Summary Card */}
      <div className="rounded-sm border border-border-default bg-bg-surface p-5">
        <h3 className="mb-4 font-mono text-caption uppercase tracking-wider text-text-secondary">
          Summary
        </h3>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div>
            <dt className="text-caption text-text-secondary">Priority</dt>
            <dd>
              <span
                className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${PRIORITY_COLORS[wo.priority] ?? PRIORITY_COLORS.low}`}
              >
                {wo.priority.toUpperCase()}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Status</dt>
            <dd>
              <span className="text-body text-text-primary">{STATUS_LABELS[wo.status]}</span>
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Defect</dt>
            <dd className="text-body text-text-primary">
              {wo.defect ? (
                <span>{wo.defect.description}</span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Asset</dt>
            <dd className="text-body text-text-primary">
              {wo.asset ? (
                <span className="inline-flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-text-secondary" />
                  <span className="font-mono">{wo.asset.assetCode}</span> · {wo.asset.name}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Plant</dt>
            <dd className="text-body text-text-primary">
              {wo.asset?.plantName ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                  {wo.asset.plantName}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Assigned To</dt>
            <dd className="text-body text-text-primary">
              {wo.assigneeName ? (
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-text-secondary" />
                  {wo.assigneeName}
                </span>
              ) : (
                <span className="text-text-muted">Unassigned</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-caption text-text-secondary">Deadline</dt>
            <dd className="text-body text-text-primary">
              {wo.deadline ? (
                <span className="inline-flex items-center gap-1.5 font-mono">
                  <Clock className="h-3.5 w-3.5 text-text-secondary" />
                  {wo.deadline}
                </span>
              ) : (
                <span className="text-text-muted">—</span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Assignment dropdown — only for open work orders */}
        {wo.status === 'open' && (
          <>
            <select
              className="rounded-sm border border-border-default bg-bg-primary px-3 py-2 font-mono text-caption text-text-primary focus:border-accent-primary focus:outline-none"
              value={assignId}
              onChange={(e) => setAssignId(e.target.value)}
              disabled={isMutating}
            >
              <option value="">Select technician…</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAssign}
              disabled={!assignId || isMutating}
            >
              Assign
            </Button>
          </>
        )}

        {/* Status advancement button — only for assigned or in_progress WOs.
            open→assigned is handled exclusively by the Assign action above. */}
        {wo.status !== 'open' && nextStatus && (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAdvanceStatus}
            disabled={isMutating}
          >
            Move to {STATUS_LABELS[nextStatus]}
          </Button>
        )}
      </div>

      {/* Error display */}
      {(changeStatus.error || assign.error || addNote.error) && (
        <div className="rounded-sm border border-accent-signal bg-accent-signal/5 p-3 text-caption text-accent-signal">
          {(changeStatus.error as Error)?.message ??
            (assign.error as Error)?.message ??
            (addNote.error as Error)?.message ??
            'An error occurred.'}
        </div>
      )}

      {/* Maintenance Notes */}
      <section>
        <h2 className="mb-3 text-h4 font-semibold text-text-primary">Maintenance Notes</h2>

        {wo.notes && wo.notes.length > 0 ? (
          <div className="mb-4 space-y-3">
            {wo.notes.map((n) => (
              <div
                key={n.id}
                className="rounded-sm border border-border-default bg-neutral-50/50 p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-caption font-semibold text-text-primary">
                    {n.technicianName ?? 'Unknown'}
                  </span>
                  <span className="font-mono text-[10px] text-text-secondary">
                    {formatDateTime(n.createdAt)}
                  </span>
                  {n.statusChangeTo && (
                    <StatusBadge status={n.statusChangeTo} />
                  )}
                </div>
                <p className="whitespace-pre-wrap text-caption text-text-secondary">{n.note}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mb-4 text-caption text-text-muted">No maintenance notes yet.</p>
        )}

        {/* Add Note Form */}
        <div className="rounded-sm border border-border-default bg-bg-surface p-4">
          <textarea
            className="w-full resize-y rounded-sm border border-border-default bg-bg-primary px-3 py-2 font-mono text-caption text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
            rows={3}
            placeholder="Add a maintenance note…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            disabled={isMutating}
          />
          <div className="mt-2 flex items-center gap-3">
            {/* Advance checkbox — hide for open WOs since open→assigned must go through Assign */}
            {wo.status !== 'open' && nextStatus && (
              <label className="inline-flex cursor-pointer items-center gap-1.5 font-mono text-caption text-text-secondary">
                <input
                  type="checkbox"
                  checked={advanceOnNote}
                  onChange={(e) => setAdvanceOnNote(e.target.checked)}
                  disabled={isMutating || wo.status === 'completed'}
                  className="size-3.5 accent-accent-primary"
                />
                Advance to {STATUS_LABELS[nextStatus]}
              </label>
            )}
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNote}
              disabled={!noteText.trim() || isMutating || wo.status === 'completed'}
            >
              Add Note
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}