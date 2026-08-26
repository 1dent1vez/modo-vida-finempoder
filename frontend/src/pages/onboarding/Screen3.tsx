import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import onb3 from '../../assets/onb3.png';
import { isOnboarded, setOnboarded } from '@/shared/utils/onboarding';
import { useAuth } from '../../store/auth';
import { track, EVENTOS } from '@/lib/analytics';
import { getLessonPath as getPresupuestoLessonPath } from '../modules/presupuesto/lessonFlow';
import { getLessonPath as getAhorroLessonPath } from '../modules/ahorro/lessonFlow';
import { loadOnboardingPrefs } from './onboardingPrefs';

/** Sugerencia de inicio según la confianza elegida en P1 (sin ramificar
 *  contenido): recién empiezo/perdido → Presupuesto L01; ya ahorro → Ahorro L01. */
function rutaInicialSugerida(): string {
  const { confianza } = loadOnboardingPrefs();
  if (confianza === 'ya-ahorro') return getAhorroLessonPath('L01');
  return getPresupuestoLessonPath('L01');
}

export default function Screen3() {
  const nav = useNavigate();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);
  const userId = user?.id ?? 'local';

  useEffect(() => {
    if (!hydrated) return;
    if (isOnboarded(userId, user?.email)) {
      nav('/app', { replace: true });
      return;
    }
    track(EVENTOS.ONBOARDING_STEP, { step: 3 });
  }, [hydrated, userId, user?.email, nav]);

  const finish = () => {
    setOnboarded(userId, user?.email);
    nav('/app', { replace: true });
  };

  const start = () => {
    setOnboarded(userId, user?.email);
    track(EVENTOS.ONBOARDING_COMPLETED);
    nav(rutaInicialSugerida(), { replace: true });
  };

  if (!hydrated) return null;

  return (
    <OnboardingLayout
      img={onb3}
      title="Tu primera lección te espera"
      body="Empezamos con lo básico: presupuestar sin culpa. 5 minutos, en tu celular."
      step={3}
      primaryLabel="Comenzar"
      onPrimary={start}
      onSkip={finish}
      secondaryLabel="Ahora no, explorar"
      onSecondary={finish}
    />
  );
}
