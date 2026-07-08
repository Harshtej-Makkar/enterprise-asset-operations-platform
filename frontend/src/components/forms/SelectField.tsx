import { ChevronDown } from 'lucide-react';
import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  /** When true, renders the label above the field */
  showLabel?: boolean;
  options: Array<{ value: string; label: string }>;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  function SelectField({ label, error, showLabel = true, options, className, id, ...props }, ref) {
    const fieldId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {showLabel && label && (
          <label htmlFor={fieldId} className="text-caption font-medium text-text-secondary">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={cn(
              'h-10 w-full appearance-none rounded-sm border border-border-default bg-bg-surface pl-3 pr-9 text-body text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40',
              error && 'border-status-critical focus:border-status-critical focus:ring-status-critical/40',
              className,
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-surface text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
        </div>
        {error && <p className="text-caption text-status-critical">{error}</p>}
      </div>
    );
  },
);
