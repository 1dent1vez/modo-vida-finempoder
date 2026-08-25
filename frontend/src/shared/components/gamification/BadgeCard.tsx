import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import FECard from '../FECard';
import type { Badge } from '../../../data/badges';

export interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  return (
    <FECard
      variant="flat"
      className={cn(
        'flex flex-col items-center text-center gap-1 py-4 transition-all duration-200',
        !unlocked && 'grayscale opacity-55'
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center leading-none" aria-hidden="true">
        {unlocked ? (
          <badge.icon className="h-9 w-9 text-[var(--color-brand-primary)]" />
        ) : (
          <Lock className="h-8 w-8 text-[var(--color-text-muted)]" />
        )}
      </span>

      <p className={cn('text-sm font-bold leading-tight', unlocked ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]')}>
        {badge.title}
      </p>

      <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
        {unlocked ? badge.description : badge.hint}
      </p>
    </FECard>
  );
}
