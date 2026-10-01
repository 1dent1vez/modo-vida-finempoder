import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import onb2 from '../../assets/onb2.png';
import { isOnboarded, setOnboarded } from '@/shared/utils/onboarding';
import { useAuth } from '../../store/auth';
import { track, EVENTOS } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  DAILY_GOAL_META,
  DAILY_GOAL_ORDER,
  DAILY_GOAL_XP,
  DEFAULT_DAILY_LEVEL,
  useDailyGoal,
  type DailyGoalLevel,
} from '../../store/dailyGoal';

export default function Screen2() {
  const nav = useNavigate();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const userId = user?.id ?? 'local';
  const level = useDailyGoal((s) => s.level);
  const setLevel = useDailyGoal((s) => s.setLevel);

  const [selected, setSelected] = useState<DailyGoalLevel>(level ?? DEFAULT_DAILY_LEVEL);

  useEffect(() => {
    if (!hydrated) return;
    if (isOnboarded(userId, user?.email)) {
      nav('/app', { replace: true });
      return;
    }
    track(EVENTOS.ONBOARDING_STEP, { step: 2 });
  }, [hydrated, userId, user?.email, nav]);

  const finish = () => {
    setOnboarded(userId, user?.email);
    nav('/app', { replace: true });
  };

  const next = () => {
    setLevel(selected);
    nav('/onboarding/3');
  };

  if (!hydrated) return null;

  return (
    <OnboardingLayout
      img={onb2}
      title="Tu meta diaria"
      body="Una racha se mantiene con pasos pequeños. Elige cuánto practicarás al día."
      step={2}
      primaryLabel="Siguiente"
      onPrimary={next}
      onSkip={finish}
    >
      <div className="grid w-full grid-cols-3 gap-2">
        {DAILY_GOAL_ORDER.map((opt) => {
          const active = selected === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => setSelected(opt)}
              aria-pressed={active}
              className={cn(
                'rounded-xl border-2 p-3 text-center transition-colors',
                active
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-info-bg)]'
                  : 'border-[var(--color-neutral-200)] bg-white'
              )}
            >
              <span className="block text-sm font-bold">{DAILY_GOAL_META[opt].label}</span>
              <span className="block text-xs text-[var(--color-text-secondary)]">
                {DAILY_GOAL_META[opt].lessons} · {DAILY_GOAL_XP[opt]} XP
              </span>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
