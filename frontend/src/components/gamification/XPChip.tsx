export interface XPChipProps {
  xp: number;
}

export function XPChip({ xp }: XPChipProps) {
  if (xp <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--color-brand-secondary)]/15 text-[var(--color-brand-secondary)] text-xs font-bold">
      ⚡ {xp} XP
    </span>
  );
}
