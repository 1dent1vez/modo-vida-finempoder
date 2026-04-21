import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  barClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, barClassName, ...props }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn('relative h-2 w-full overflow-hidden rounded-full bg-[var(--color-neutral-100)]', className)}
        {...props}
      >
        <div
          className={cn('h-full rounded-full bg-[var(--color-brand-primary)] transition-all duration-300', barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
