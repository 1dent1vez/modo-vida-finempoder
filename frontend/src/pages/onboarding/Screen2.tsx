import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import onb2 from '../../assets/onb2.png';
import { isOnboarded, setOnboarded } from '@/shared/utils/onboarding';
import { useAuth } from '../../store/auth';

export default function Screen2() {
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
      img={onb2}
      title="Ahorra con proposito"
      body="Aprende a establecer metas financieras alcanzables y crea el habito del ahorro sin sacrificar tu bienestar."
      step={2}
      primaryLabel="Siguiente"
      onPrimary={() => nav('/onboarding/3')}
      onSkip={finish}
    />
  );
}
