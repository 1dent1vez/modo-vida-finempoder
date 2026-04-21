export interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-brand-warning)]/15 text-[var(--color-brand-warning)] text-xs font-bold">
      🔥 {streak} días
    </span>
  );
}
