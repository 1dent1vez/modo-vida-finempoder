export interface ShieldBadgeProps {
  shields: number;
}

/** Escudos de racha (streak freeze): solo se muestra si hay al menos 1. */
export function ShieldBadge({ shields }: ShieldBadgeProps) {
  if (shields <= 0) return null;

  return (
    <div
      className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-info-bg)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-info)]"
      title="Escudos de racha: protegen tu racha si faltas un día"
      aria-label={`${shields} ${shields === 1 ? 'escudo' : 'escudos'} de racha`}
    >
      <span aria-hidden="true">🛡</span>
      {shields}
    </div>
  );
}
