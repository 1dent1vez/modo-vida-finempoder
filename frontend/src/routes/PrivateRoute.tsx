import { Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useUserProgressSync } from '../hooks/progress/useUserProgressSync';
import { useGamification } from '../hooks/gamification/useGamification';
import { ResearchGate } from '../components/ResearchGate';
import { AppLayout } from '../components/layout/AppLayout';
import { GuestBanner } from '../components/GuestBanner';

export function PrivateRoute() {
  const hasHydrated = useAuth((s) => s.hydrated);
  const token = useAuth((s) => s.token);

  // El progreso y la gamificación ya tienen guardas `if (!token) return`,
  // y lessonProgress.repository usa userId='local' cuando no hay sesión.
  // El modo invitado NO redirige a /login: el usuario entra y juega de inmediato.
  useUserProgressSync();
  useGamification();
  if (!hasHydrated) return null; // evita redirecciones antes de rehidratar

  return (
    <ResearchGate>
      <AppLayout>
        {!token && <GuestBanner />}
        <Outlet />
      </AppLayout>
    </ResearchGate>
  );
}
