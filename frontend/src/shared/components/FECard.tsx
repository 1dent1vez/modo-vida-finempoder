import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';

type CardVariant = 'flat' | 'elevated' | 'hero';

interface FECardProps extends ComponentPropsWithoutRef<'div'> {
  variant?: CardVariant;
  clickable?: boolean;
}

const variantClass: Record<CardVariant, string> = {
  flat:     'p-4 rounded-xl border border-[var(--color-neutral-200)] shadow-none',
  elevated: 'p-4 rounded-xl border-none shadow-[var(--shadow-sm)]',
  hero:     'p-6 rounded-2xl border-none shadow-[var(--shadow-md)]',
};

export default function FECard({
  variant = 'flat',
  clickable = false,
  className,
  children,
  onClick,
  ...rest
}: FECardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white',
        variantClass[variant],
        clickable && 'cursor-pointer transition-shadow duration-150 hover:shadow-[var(--shadow-md)] active:shadow-[var(--shadow-sm)]',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
