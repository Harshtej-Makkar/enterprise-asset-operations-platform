import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
  title: string;
  description?: string;
  /** The chart node (a Recharts component, or anything else) */
  children: ReactNode;
  /** Right-aligned action area (e.g. range selector) */
  actions?: ReactNode;
  /** Optional legend rendered below the chart */
  legend?: ReactNode;
  className?: string;
  /** When true, renders a small empty-state placeholder (for sparse data) */
  isEmpty?: boolean;
  emptyMessage?: string;
}

/**
 * Recharts wrapper that applies the design tokens: card chrome, dark
 * background, subtle grid, legend at the bottom. Charts live inside this
 * card so the whole dashboard grid reads as a set of consistent units.
 */
export function ChartCard({
  title,
  description,
  children,
  actions,
  legend,
  className,
  isEmpty = false,
  emptyMessage = 'No data yet — data will appear here once upstream modules produce it.',
}: ChartCardProps) {
  return (
    <div className={cn('rounded-sm border border-border-default bg-bg-surface p-4', className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-h4 font-semibold text-text-primary">{title}</h3>
          {description && <p className="mt-0.5 text-caption text-text-secondary">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      <div className="min-h-[220px]">
        {isEmpty ? (
          <div className="grid h-[220px] place-items-center text-center text-caption text-text-secondary">
            {emptyMessage}
          </div>
        ) : (
          children
        )}
      </div>
      {legend && <div className="mt-3 flex flex-wrap items-center gap-3 text-caption text-text-secondary">{legend}</div>}
    </div>
  );
}
