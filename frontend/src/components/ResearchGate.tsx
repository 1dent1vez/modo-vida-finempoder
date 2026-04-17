import { Navigate, useLocation } from 'react-router-dom';
import { useResearchStatus } from '../hooks/research/useResearchStatus';
import { evaluateResearchGate } from '../utils/researchGate';
import { useAuth } from '../store/auth';
import { isOnboarded } from '../utils/onboarding';

export function ResearchGate({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const status = useResearchStatus();
  const user = useAuth((s) => s.user);

  if (!user) return <Navigate to="/login" replace />;
  if (status.isLoading) return null;

  const onboardingDone = isOnboarded(user.id, user.email);
  const redirect = evaluateResearchGate(pathname, status.data ?? undefined, onboardingDone);
  if (redirect) return <Navigate to={redirect} replace />;

  return <>{children}</>;
}
