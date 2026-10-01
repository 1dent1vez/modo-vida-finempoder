import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import onb1 from '../../assets/onb1.png';
import { isOnboarded, setOnboarded } from '@/shared/utils/onboarding';
import { useAuth } from '../../store/auth';
import { track, EVENTOS } from '@/lib/analytics';
import { cn } from '@/lib/utils';
import {
  ONBOARDING_CONFIANZA_OPTIONS,
  loadOnboardingPrefs,
  saveOnboardingConfianza,
  type OnboardingConfianza,
} from './onboardingPrefs';

export default function Screen1() {
  const nav = useNavigate();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const userId = user?.id ?? 'local';

  const [confianza, setConfianza] = useState<OnboardingConfianza>(
    () => loadOnboardingPrefs().confianza
  );

  useEffect(() => {
    if (!hydrated) return;
    if (isOnboarded(userId, user?.email)) {
      nav('/app', { replace: true });
      return;
    }
    track(EVENTOS.ONBOARDING_STARTED);
    track(EVENTOS.ONBOARDING_STEP, { step: 1 });
  }, [hydrated, userId, user?.email, nav]);

  const finish = () => {
    setOnboarded(userId, user?.email);
    nav('/app', { replace: true });
  };

  const choose = (value: OnboardingConfianza) => {
    setConfianza(value);
    saveOnboardingConfianza(value);
  };

  const next = () => {
    saveOnboardingConfianza(confianza);
    nav('/onboarding/2');
  };

  if (!hydrated) return null;

  return (
    <OnboardingLayout
      img={onb1}
      title="Aprende a tomar el control de tu dinero"
      body="FinEMPODER es gratis para siempre. Aprende a organizar tus ingresos y gastos con herramientas simples, hechas para México."
      step={1}
      primaryLabel="Siguiente"
      onPrimary={next}
      onSkip={finish}
    >
      <div className="flex w-full flex-col gap-2">
        {ONBOARDING_CONFIANZA_OPTIONS.map((opt) => {
          const active = confianza === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => choose(opt.value)}
              aria-pressed={active}
              className={cn(
                'rounded-xl border-2 px-3 py-3 text-sm font-bold transition-colors',
                active
                  ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-info-bg)]'
                  : 'border-[var(--color-neutral-200)] bg-white'
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
