import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * shadcn/ui Button — adapted to EAOP design tokens.
 * Deliberately sharp radii (4px) per doc 13 §6.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus disabled:pointer-events-none disabled:opacity-40',
  {
    variants: {
      variant: {
        primary: 'bg-status-info text-text-primary hover:bg-[#4A7AD8] active:bg-[#3D6BC8]',
        secondary:
          'bg-bg-surface-raised text-text-primary border border-border-default hover:bg-bg-surface hover:border-border-strong',
        ghost: 'text-text-primary hover:bg-bg-surface-raised',
        destructive: 'bg-status-critical text-text-primary hover:bg-[#C73A3F] active:bg-[#B0333A]',
        outline:
          'border border-border-default text-text-primary hover:bg-bg-surface-raised hover:border-border-strong',
        link: 'text-status-info underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-caption rounded-sm',
        md: 'h-10 px-4 text-body rounded-sm',
        lg: 'h-12 px-6 text-body-lg rounded-sm',
        icon: 'h-10 w-10 rounded-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
