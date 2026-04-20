import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useUserProgressSync } from '../hooks/progress/useUserProgressSync';
import { useGamification } from '../hooks/gamification/useGamification';
import { ResearchGate } from '../components/ResearchGate';
import { AppLayout } from '../components/layout/AppLayout';

export function PrivateRoute() {
  const hasHydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);

  useUserProgressSync();
  useGamification();

  if (!hasHydrated) return null; // evita redirecciones antes de rehidratar

  if (!token) return <Navigate to="/login" replace />;

  return (
    <ResearchGate>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </ResearchGate>
  );
}
