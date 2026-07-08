import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';

/**
 * Domain status → badge variant mapping.
 *
 * Backed by reference/13-Design-Tokens-Specification.md §19 — the canonical
 * status-to-color mapping. A single source of truth for every status string
 * the application produces: asset state, inspection result, defect status,
 * defect severity, work-order status, work-order priority, etc.
 *
 * Adding a new domain status? Add the raw value + the variant it maps to
 * here, not inline at the call site. Components stay free of color logic.
 *
 * Defensive guarantee: `StatusBadge` (and its helpers) MUST never crash
 * on a missing/undefined/null status string. A missing field is treated
 * as "Unknown" and rendered with the `--status-neutral` token. This is
 * a production concern — a backend field rename, a stale cache, or a
 * malformed record should not be able to take down an entire page.
 */

export type StatusVariant =
  | 'success' // active / resolved / completed / approved
  | 'warning' // pending / pending_approval / in_progress
  | 'critical' // rejected / failed
  | 'signal' // critical severity / SLA breach (the signature amber)
  | 'info' // open / info / assigned
  | 'neutral'; // inactive / draft / closed / unknown

const DOMAIN_STATUS_MAP: Record<string, StatusVariant> = {
  // Asset statuses
  active: 'success',
  inactive: 'neutral',
  retired: 'neutral',

  // Inspection overall result
  pass: 'success',
  fail: 'critical',
  pending: 'warning',

  // Inspection item result
  na: 'neutral',

  // Defect status
  open: 'info',
  pending_approval: 'warning',
  approved: 'success',
  rejected: 'critical',
  work_order_created: 'info',
  resolved: 'success',

  // Defect severity
  low: 'neutral',
  medium: 'warning',
  high: 'critical',

  // Work-order status
  assigned: 'info',
  in_progress: 'warning',
  completed: 'success',

  // Work-order priority
  urgent: 'signal',
};

const VARIANT_LABEL_MAP: Record<StatusVariant, Record<string, string>> = {
  success: {
    active: 'Active',
    pass: 'Pass',
    resolved: 'Resolved',
    completed: 'Completed',
    approved: 'Approved',
  },
  warning: {
    pending: 'Pending',
    pending_approval: 'Pending Approval',
    in_progress: 'In Progress',
    medium: 'Medium',
  },
  critical: {
    fail: 'Fail',
    rejected: 'Rejected',
    high: 'High',
  },
  signal: {
    critical: 'Critical',
    urgent: 'Urgent',
  },
  info: {
    open: 'Open',
    work_order_created: 'Work Order Created',
    assigned: 'Assigned',
  },
  neutral: {
    inactive: 'Inactive',
    retired: 'Retired',
    na: 'N/A',
    low: 'Low',
  },
};

/** The literal label rendered when a status is missing/unknown. */
const UNKNOWN_LABEL = 'Unknown';

/**
 * Returns the variant for a given status string. Coerces non-string values
 * to an empty string so the lookup falls through to the neutral fallback.
 */
export function variantForStatus(status: unknown): StatusVariant {
  if (typeof status !== 'string' || status.length === 0) {
    return 'neutral';
  }
  return DOMAIN_STATUS_MAP[status] ?? 'neutral';
}

/**
 * Returns the humanised label for a given status string. Always returns
 * a non-empty string — "Unknown" for null/empty/unknown values.
 */
export function labelForStatus(status: unknown): string {
  if (typeof status !== 'string' || status.length === 0) {
    return UNKNOWN_LABEL;
  }
  const variant = variantForStatus(status);
  return VARIANT_LABEL_MAP[variant]?.[status] ?? humanize(status);
}

function humanize(s: string): string {
  if (!s) return UNKNOWN_LABEL;
  return s
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

interface StatusBadgeProps {
  /** Domain status string, e.g. 'pending_approval', 'in_progress', 'critical'.
   *  Optional — when missing/null/undefined the badge renders "Unknown"
   *  with the neutral variant rather than crashing the page. */
  status?: string | null;
  /** Override the displayed label (defaults to a humanized version) */
  label?: string;
  /** Override the variant computed from the status map */
  variant?: StatusVariant;
  /** Optional icon rendered before the label (e.g. a lucide icon) */
  icon?: ReactNode;
  className?: string;
}

/**
 * Renders a status pill backed by design tokens.
 * The actual color comes from the design system; this component is purely
 * the mapping + label logic. Never throws — see "Defensive guarantee" above.
 */
export function StatusBadge({ status, label, variant, icon, className }: StatusBadgeProps) {
  const computedVariant = variant ?? variantForStatus(status);
  const computedLabel = label ?? labelForStatus(status);
  return (
    <Badge variant={computedVariant} className={className}>
      {icon}
      {computedLabel}
    </Badge>
  );
}
