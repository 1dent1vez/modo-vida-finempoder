import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OnboardingLayout from './OnboardingLayout';
import onb3 from '../../assets/onb3.png';
import { isOnboarded, setOnboarded } from '../../utils/onboarding';
import { useAuth } from '../../store/auth';

export default function Screen3() {
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
      img={onb3}
      title="Invierte en tu futuro"
      body="Conoce los fundamentos de la inversion y desarrolla habilidades para hacer crecer tu dinero de forma responsable."
      step={3}
      primaryLabel="Iniciar"
      onPrimary={finish}
    />
  );
}
