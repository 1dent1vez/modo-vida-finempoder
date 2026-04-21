import { Flame } from 'lucide-react';

export interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[var(--color-status-warningBg)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-warning)]">
      <Flame className="h-3 w-3" />
      {streak} días
    </div>
  );
}
