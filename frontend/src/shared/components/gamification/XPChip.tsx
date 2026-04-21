import { Zap } from 'lucide-react';

export interface XPChipProps {
  xp: number;
}

export function XPChip({ xp }: XPChipProps) {
  if (xp <= 0) return null;

  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[var(--color-status-warningBg)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-warning)]">
      <Zap className="h-3 w-3" />
      {xp} XP
    </div>
  );
}
