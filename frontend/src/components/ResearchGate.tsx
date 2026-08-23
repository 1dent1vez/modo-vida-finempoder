import { Navigate, useLocation } from 'react-router-dom';
import { useResearchStatus } from '../hooks/research/useResearchStatus';
import { evaluateResearchGate } from '@/shared/utils/researchGate';
import { useAuth } from '../store/auth';
import { isOnboarded } from '@/shared/utils/onboarding';

export function ResearchGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const status = useResearchStatus();
  const user = useAuth((s) => s.user);

  // Modo invitado (sin sesión): el research gate es solo para usuarios
  // logueados (modelo B2B2C). El invitado entra y juega de inmediato.
  if (!user) return <>{children}</>;
  if (status.isLoading) return null;

  const onboardingDone = isOnboarded(user.id, user.email);
  const redirect = evaluateResearchGate(pathname, status.data ?? undefined, onboardingDone);
  if (redirect) return <Navigate to={redirect} replace />;

  return <>{children}</>;
}
