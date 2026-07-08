import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  /** Debounce delay in ms before onChange fires. Default 300. */
  debounceMs?: number;
  /** When true, call onChange synchronously on every keystroke. */
  immediate?: boolean;
  className?: string;
  inputClassName?: string;
}

/**
 * Debounced search input.
 *
 * The local input state updates synchronously (so the user sees their
 * typing), but the parent only sees the value after `debounceMs` of
 * quiet time. This is the standard pattern for "type to filter" UIs
 * that hit a server — avoids issuing a request per keystroke.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  immediate = false,
  className,
  inputClassName,
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Keep local state in sync if the parent resets the value externally.
  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (immediate) {
      onChangeRef.current(local);
      return;
    }
    if (local === value) return; // nothing to push up
    const t = window.setTimeout(() => onChangeRef.current(local), debounceMs);
    return () => window.clearTimeout(t);
  }, [local, debounceMs, immediate, value]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocal(e.target.value);
  };

  const handleClear = () => {
    setLocal('');
    onChange('');
  };

  return (
    <div className={cn('relative w-full sm:w-72', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
      <input
        type="text"
        value={local}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-sm border border-border-default bg-bg-surface pl-9 pr-9 text-body text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-border-focus/40',
          inputClassName,
        )}
        aria-label={placeholder}
      />
      {local && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-sm text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
