import { cn } from '@/lib/utils';
import FECard from './FECard';
import type { ReactNode } from 'react';

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: 'primary' | 'warning' | 'success' | 'info';
  size?: 'sm' | 'md';
}

const colorMap: Record<string, string> = {
  primary: 'text-[var(--color-brand-primary)]',
  warning: 'text-[var(--color-brand-warning)]',
  success: 'text-[var(--color-brand-success)]',
  info: 'text-[var(--color-brand-info)]',
};

const valueSizeMap: Record<string, string> = {
  sm: 'text-xl',
  md: 'text-3xl',
};

export function StatCard({ icon, label, value, color = 'primary', size = 'md' }: StatCardProps) {
  const colorClass = colorMap[color];

  return (
    <FECard variant="flat" className="flex flex-col items-center text-center gap-1 py-3">
      <div className={cn('flex items-center justify-center [&_svg]:h-6 [&_svg]:w-6', colorClass)}>
        {icon}
      </div>
      <span className={cn('font-extrabold leading-none', colorClass, valueSizeMap[size])}>
        {value}
      </span>
      <span className="text-xs text-[var(--color-text-secondary)] leading-tight">{label}</span>
    </FECard>
  );
}
