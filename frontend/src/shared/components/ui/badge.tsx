import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-brand-primary)] text-white',
        secondary: 'bg-[var(--color-neutral-100)] text-[var(--color-neutral-700)]',
        success: 'bg-[var(--color-status-successBg)] text-[var(--color-status-success)]',
        warning: 'bg-[var(--color-status-warningBg)] text-[var(--color-status-warning)]',
        error: 'bg-[var(--color-status-errorBg)] text-[var(--color-status-error)]',
        info: 'bg-[var(--color-status-infoBg)] text-[var(--color-status-info)]',
        outline: 'border border-[var(--color-neutral-200)] text-[var(--color-neutral-700)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
