import { ArrowDown, ArrowUp, type LucideIcon, Minus } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type StatTone = 'success' | 'warning' | 'critical' | 'info' | 'neutral' | 'signal';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  /** Optional percentage change; positive numbers shown green, negative red */
  trend?: number;
  /** Optional trend label (e.g. "vs last week") */
  trendLabel?: string;
  /** Optional tone to drive the icon background colour */
  tone?: StatTone;
  /** Optional footer node (e.g. "12 of 20 active") */
  footer?: ReactNode;
  className?: string;
}

const TONE_MAP: Record<StatTone, { bg: string; fg: string }> = {
  success: { bg: 'bg-[rgba(63,179,127,0.12)]', fg: 'text-status-success' },
  warning: { bg: 'bg-[rgba(217,169,62,0.12)]', fg: 'text-status-warning' },
  critical: { bg: 'bg-[rgba(229,72,77,0.12)]', fg: 'text-status-critical' },
  info: { bg: 'bg-[rgba(91,141,239,0.12)]', fg: 'text-status-info' },
  neutral: { bg: 'bg-[rgba(91,100,114,0.12)]', fg: 'text-status-neutral' },
  signal: { bg: 'bg-[rgba(245,166,35,0.14)]', fg: 'text-accent-signal' },
};

/**
 * KPI card for the dashboard.
 * Title + value + icon + optional trend. Tone-driven accent colour comes
 * from the design system — never an arbitrary hex.
 */
export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  tone = 'info',
  footer,
  className,
}: StatCardProps) {
  const palette = TONE_MAP[tone];
  const trendIsPositive = typeof trend === 'number' && trend > 0;
  const trendIsNegative = typeof trend === 'number' && trend < 0;
  const TrendIcon = trendIsPositive ? ArrowUp : trendIsNegative ? ArrowDown : Minus;
  const trendColor = trendIsPositive
    ? 'text-status-success'
    : trendIsNegative
      ? 'text-status-critical'
      : 'text-text-secondary';

  return (
    <div className={cn('rounded-sm border border-border-default bg-bg-surface p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-caption font-medium text-text-secondary">{title}</p>
          <p className="mt-2 text-h2 font-bold text-text-primary">{value}</p>
        </div>
        {Icon && (
          <div className={cn('grid h-10 w-10 shrink-0 place-items-center rounded-sm', palette.bg, palette.fg)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {(typeof trend === 'number' || footer) && (
        <div className="mt-3 flex items-center gap-2 text-caption">
          {typeof trend === 'number' && (
            <span className={cn('inline-flex items-center gap-0.5 font-medium', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {Math.abs(trend)}%
            </span>
          )}
          {trendLabel && <span className="text-text-secondary">{trendLabel}</span>}
          {footer && <span className="ml-auto text-text-secondary">{footer}</span>}
        </div>
      )}
    </div>
  );
}
