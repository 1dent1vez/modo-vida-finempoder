import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightElement, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 flex items-center text-[var(--color-neutral-400)] [&_svg]:h-4 [&_svg]:w-4">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white px-4 py-3 text-sm transition-colors',
              'placeholder:text-[var(--color-neutral-400)]',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-primary)] focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightElement && 'pr-10',
              error
                ? 'border-[var(--color-brand-error)] focus:ring-[var(--color-brand-error)]'
                : 'border-[var(--color-neutral-200)]',
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3 flex items-center">
              {rightElement}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--color-brand-error)]">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
