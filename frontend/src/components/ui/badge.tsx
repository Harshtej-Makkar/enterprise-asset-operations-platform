import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * EAOP Status Badge.
 * Backed by doc 13 §19 — the canonical status→token mapping.
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-caption font-medium border whitespace-nowrap',
  {
    variants: {
      variant: {
        success:
          'bg-[rgba(63,179,127,0.12)] text-status-success border-[rgba(63,179,127,0.32)]',
        warning:
          'bg-[rgba(217,169,62,0.12)] text-status-warning border-[rgba(217,169,62,0.32)]',
        critical:
          'bg-[rgba(229,72,77,0.12)] text-status-critical border-[rgba(229,72,77,0.32)]',
        info: 'bg-[rgba(91,141,239,0.12)] text-status-info border-[rgba(91,141,239,0.32)]',
        neutral:
          'bg-[rgba(91,100,114,0.12)] text-status-neutral border-[rgba(91,100,114,0.32)]',
        signal:
          'bg-[rgba(245,166,35,0.14)] text-accent-signal border-[rgba(245,166,35,0.4)]',
        outline: 'border-border-default text-text-secondary',
      },
    },
    defaultVariants: {
      variant: 'outline',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
