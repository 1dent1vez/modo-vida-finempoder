import { useState } from 'react';
import { Button } from '../../shared/components/ui/button';
import {
  DAILY_GOAL_META,
  DAILY_GOAL_ORDER,
  DAILY_GOAL_XP,
  DEFAULT_DAILY_LEVEL,
  useDailyGoal,
  type DailyGoalLevel,
} from '../../store/dailyGoal';
import { cn } from '@/lib/utils';

/**
 * Onboarding "Tu meta diaria" al primer uso (guest o logueado).
 * NO bloquea la app: "Ahora no" solo lo oculta por la sesión (level sigue
 * null → runtime usa Regular y el diálogo reaparece en el siguiente arranque).
 */
export function DailyGoalDialog() {
  const level = useDailyGoal((s) => s.level);
  const setLevel = useDailyGoal((s) => s.setLevel);
  const [selected, setSelected] = useState<DailyGoalLevel>(DEFAULT_DAILY_LEVEL);
  const [dismissed, setDismissed] = useState(false);

  if (level !== null || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Tu meta diaria"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[var(--shadow-lg)]">
        <h2 className="mb-1 text-lg font-extrabold">Tu meta diaria</h2>
        <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
          ¿Cuántas lecciones quieres completar cada día?
        </p>

        <div className="mb-4 space-y-2">
          {DAILY_GOAL_ORDER.map((opt) => {
            const active = selected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setSelected(opt)}
                aria-pressed={active}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border-2 p-3 text-left transition-colors',
                  active
                    ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-info-bg)]'
                    : 'border-[var(--color-neutral-200)]'
                )}
              >
                <span className="text-sm font-bold">{DAILY_GOAL_META[opt].label}</span>
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {DAILY_GOAL_META[opt].lessons} · {DAILY_GOAL_XP[opt]} XP
                </span>
              </button>
            );
          })}
        </div>

        <Button className="w-full min-h-11" onClick={() => setLevel(selected)}>
          Empezar
        </Button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="mt-2 w-full py-2 text-center text-xs font-semibold text-[var(--color-text-muted)]"
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}
