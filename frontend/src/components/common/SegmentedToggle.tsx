import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Accessible label for the group (e.g. "Inspections view") */
  ariaLabel: string;
  className?: string;
}

/**
 * Segmented pill toggle. Three-state (or more) control for picking
 * between views. Generic over the value type so callers don't have
 * to cast. Used by the dashboard "Inspections by week" chart to
 * switch between Day / Week / Month.
 *
 * Visual design: single rounded pill, with the active option
 * highlighted via `--bg-elevated` and the design-token border.
 */
export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center rounded-pill border border-border-default bg-bg-elevated p-0.5',
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              'h-7 rounded-pill px-3 font-mono text-caption uppercase tracking-wider transition-colors',
              active
                ? 'bg-bg-surface text-text-primary shadow-[0_0_0_1px_rgba(91,141,239,0.35)]'
                : 'text-text-secondary hover:text-text-primary',
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
