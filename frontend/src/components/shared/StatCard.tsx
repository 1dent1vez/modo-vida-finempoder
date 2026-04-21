import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';
import FECard from '../FECard';

export interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  color?: 'primary' | 'warning' | 'success' | 'info';
  size?: 'sm' | 'md';
}

const colorClass = {
  primary: 'text-[var(--color-brand-primary)]',
  warning: 'text-[var(--color-brand-warning)]',
  success: 'text-[var(--color-brand-success)]',
  info:    'text-[var(--color-brand-primary)]',
} as const;

const sizeClass = {
  sm: { icon: 'text-xl', value: 'text-xl font-extrabold', p: 'p-3' },
  md: { icon: 'text-3xl', value: 'text-3xl font-extrabold', p: 'p-4' },
} as const;

export function StatCard({ icon, label, value, color = 'primary', size = 'md' }: StatCardProps) {
  const s = sizeClass[size];
  return (
    <FECard variant="flat" className={cn('flex flex-col items-center gap-2 text-center', s.p)}>
      <span className={cn(s.icon, colorClass[color])}>{icon}</span>
      <span className={cn(s.value, colorClass[color])}>{value}</span>
      <span className="text-xs text-[var(--color-text-secondary)] leading-snug">{label}</span>
    </FECard>
  );
}
