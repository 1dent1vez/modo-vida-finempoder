import { cn } from '@/lib/utils';
import FECard from '../FECard';
import type { Badge } from '../../data/badges';

export interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  return (
    <FECard
      variant="flat"
      className={cn(
        'flex flex-col items-center gap-2 p-6 text-center transition-all duration-200 relative',
        !unlocked && 'grayscale opacity-55'
      )}
    >
      <span className="text-4xl leading-none">
        {unlocked ? badge.icon : '🔒'}
      </span>

      <span className={cn('text-sm font-bold leading-snug', !unlocked && 'text-[var(--color-text-secondary)]')}>
        {badge.title}
      </span>

      <span className="text-xs text-[var(--color-text-secondary)] leading-snug">
        {unlocked ? badge.description : badge.hint}
      </span>
    </FECard>
  );
}
