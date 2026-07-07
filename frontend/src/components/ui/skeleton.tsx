import { cn } from '@/lib/utils';

/**
 * Skeleton — used for loading states per doc TRD §15.
 * Skeleton UI is preferred over spinners.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-sm bg-bg-surface-raised', className)}
      {...props}
    />
  );
}

export { Skeleton };
