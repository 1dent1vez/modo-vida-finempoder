import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import onb1 from '../../assets/onb1.png';
import { isOnboarded, setOnboarded } from '../../utils/onboarding';
import { useAuth } from '../../store/auth';

export default function Screen1() {
  const nav = useNavigate();
  const hydrated = useAuth((s) => s.hydrated);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      nav('/login', { replace: true });
      return;
    }
    if (isOnboarded(user.id, user.email)) {
      nav('/app', { replace: true });
    }
  }, [hydrated, user, nav]);

  const finish = () => {
    if (!user) return;
    setOnboarded(user.id, user.email);
    nav('/app', { replace: true });
  };

  if (!hydrated || !user) return null;

  return (
    <OnboardingLayout
      img={onb1}
      title="Aprende a tomar el control de tu dinero"
      body="Descubre como organizar tus ingresos y gastos con herramientas simples que te ayudaran a tomar decisiones financieras informadas."
      step={1}
      primaryLabel="Siguiente"
      onPrimary={() => nav('/onboarding/2')}
      onSkip={finish}
    />
  );
}
