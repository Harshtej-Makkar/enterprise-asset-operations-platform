import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FilterPanelProps {
  children: ReactNode;
  /** Optional right-aligned action area (e.g. "Reset" button) */
  actions?: ReactNode;
  className?: string;
}

/**
 * Composable filter bar.
 *
 * Wrap any combination of <SearchInput>, <SelectField>, <DatePicker>, etc.
 * inside a <FilterPanel> and they will lay out in a consistent row.
 * Used by Asset List, Inspection List, Defect List, Reports, Audit Log.
 */
export function FilterPanel({ children, actions, className }: FilterPanelProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 rounded-sm border border-border-default bg-bg-surface p-4 sm:flex-row sm:flex-wrap sm:items-end',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        {children}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
