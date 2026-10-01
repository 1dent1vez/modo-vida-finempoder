import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import FECard from '../FECard';
import type { BadgeSeries, TierLevel } from '../../../data/badges';
import { serieTitulo, siguienteHint } from '../../../data/badges';

export interface BadgeCardProps {
  serie: BadgeSeries;
  /** Tier máximo logrado (0 = ninguno). */
  nivel: 0 | TierLevel;
}

export function BadgeCard({ serie, nivel }: BadgeCardProps) {
  const unlocked = nivel > 0;

  return (
    <FECard
      variant="flat"
      className={cn(
        'flex flex-col items-center text-center gap-1.5 py-4 transition-all duration-200',
        !unlocked && 'grayscale opacity-55'
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center leading-none" aria-hidden="true">
        {unlocked ? (
          <serie.icon className="h-9 w-9 text-[var(--color-brand-primary)]" />
        ) : (
          <Lock className="h-8 w-8 text-[var(--color-text-muted)]" />
        )}
      </span>

      {/* Muescas de la serie: logrado / actual (próximo) / bloqueado. */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {serie.tiers.map((tier) => {
          const isAchieved = tier.nivel <= nivel;
          const isCurrent = tier.nivel === nivel + 1;
          return (
            <span
              key={tier.nivel}
              className={cn(
                'h-1.5 w-5 rounded-full transition-colors',
                isAchieved && 'bg-[var(--color-brand-primary)]',
                !isAchieved && isCurrent && 'border border-[var(--color-brand-primary)] bg-transparent',
                !isAchieved && !isCurrent && 'bg-[var(--color-neutral-200)]'
              )}
            />
          );
        })}
      </div>

      <p className={cn('text-sm font-bold leading-tight', unlocked ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]')}>
        {nivel > 0 ? serieTitulo(serie, nivel) : serie.tituloBase}
      </p>

      <p className="text-xs text-[var(--color-text-secondary)] leading-snug">
        {unlocked ? serie.descripcion : siguienteHint(serie, nivel)}
      </p>
    </FECard>
  );
}
