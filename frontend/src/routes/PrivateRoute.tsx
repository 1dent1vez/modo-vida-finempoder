import { Outlet } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { useUserProgressSync } from '../hooks/progress/useUserProgressSync';
import { useGamification } from '../hooks/gamification/useGamification';
import { useLeagueSync } from '../lib/leagueSync';
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
  // F4-LIGAS: escucha 'fe:lesson-completed' y sube el puntaje semanal con
  // debounce; SIN sync en guest (la propia guarda del hook lo maneja).
  useLeagueSync();

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
