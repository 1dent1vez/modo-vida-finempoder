import { Trophy, Zap, Flame, Rocket } from 'lucide-react';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import { BadgeCard } from '../../shared/components/gamification/BadgeCard';
import { XPChip } from '../../shared/components/gamification/XPChip';
import { StreakBadge } from '../../shared/components/gamification/StreakBadge';
import FECard from '../../shared/components/FECard';
import { Badge } from '../../shared/components/ui/badge';
import { Progress } from '../../shared/components/ui/progress';
import { useGamification } from '../../hooks/gamification/useGamification';
import { useProgress } from '../../store/progress';
import { useResearchStatus } from '../../hooks/research/useResearchStatus';
import { BADGES } from '../../data/badges';
import type { BadgeStats } from '../../data/badges';

const MODULE_LABELS: Record<string, string> = {
  presupuesto: 'Presupuestación',
  ahorro: 'Ahorro',
  inversion: 'Inversión',
};

const MODULE_BAR_CLASS: Record<string, string> = {
  presupuesto: 'bg-[var(--color-brand-warning)]',
  ahorro: 'bg-[var(--color-brand-success)]',
  inversion: 'bg-[var(--color-brand-info)]',
};

const MODULE_BADGE_VARIANT = {
  presupuesto: 'warning',
  ahorro: 'success',
  inversion: 'info',
} as const;

export default function Achievements() {
  const { data: gamification } = useGamification();
  const modules = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { data: research } = useResearchStatus();

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const streakCurrent = streak.current ?? 0;
  const streakBest = streak.best ?? 0;

  const presupuestoProgress = modules.presupuesto?.progress ?? 0;
  const ahorroProgress = modules.ahorro?.progress ?? 0;
  const inversionProgress = modules.inversion?.progress ?? 0;

  const totalCompleted = Math.round(
    ((presupuestoProgress + ahorroProgress + inversionProgress) / 100) * 15
  );

  const badgeStats: BadgeStats = {
    totalCompleted,
    presupuestoProgress,
    ahorroProgress,
    inversionProgress,
    streakBest,
    streakCurrent,
    preDone: research?.preDone ?? false,
    postDone: research?.postDone ?? false,
  };

  const unlockedCount = BADGES.filter((b) => b.condition(badgeStats)).length;

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)]">
      <PageHeader
        title="Logros"
        subtitle={`${unlockedCount} de ${BADGES.length} desbloqueados`}
        rightSlot={
          <>
            <XPChip xp={xp} />
            <StreakBadge streak={streakCurrent} />
          </>
        }
      />

      <div className="p-4 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <StatCard icon={<Trophy />} label="Nivel" value={level} color="warning" />
          <StatCard icon={<Zap />} label="XP total" value={xp} color="primary" />
          <StatCard icon={<Flame />} label="Racha actual" value={`${streakCurrent}d`} color="info" />
          <StatCard icon={<Rocket />} label="Mejor racha" value={`${streakBest}d`} color="success" />
        </div>

        {/* Progreso por módulo */}
        <FECard variant="flat">
          <h2 className="text-base font-bold mb-4">Progreso por módulo</h2>
          <div className="space-y-4">
            {(['presupuesto', 'ahorro', 'inversion'] as const).map((mod) => {
              const pct = modules[mod]?.progress ?? 0;
              return (
                <div key={mod}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold">{MODULE_LABELS[mod]}</span>
                    {pct >= 100 ? (
                      <Badge variant="success">Completado</Badge>
                    ) : (
                      <Badge variant={MODULE_BADGE_VARIANT[mod]}>{pct}%</Badge>
                    )}
                  </div>
                  <Progress value={pct} barClassName={MODULE_BAR_CLASS[mod]} className="h-2" />
                </div>
              );
            })}
          </div>
        </FECard>

        {/* Grid de badges */}
        <div>
          <h2 className="text-base font-bold mb-3">Mis logros</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {BADGES.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} unlocked={badge.condition(badgeStats)} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
