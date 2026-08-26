import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '@/shared/components/Spinner';
import { PrivateRoute } from './routes/PrivateRoute';
import { useAuth } from './store/auth';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import OfflineBanner from './components/OfflineBanner';
import GlobalSnackbar from './components/GlobalSnackbar';
import AdminBanner from './components/AdminBanner';
import { AchievementModal } from './shared/components/gamification/AchievementModal';
import { NewsletterPrompt } from './shared/components/growth/NewsletterPrompt';
import { NamePromptDialog } from './shared/components/auth/NamePromptDialog';
import { isAdminMode } from './lib/adminMode';
import { isOnboarded } from '@/shared/utils/onboarding';
import { LessonWrapper } from '@/features/lessons/components/LessonWrapper';

// ── Auth (static — needed at first load) ──────────────
import LoginPage from './pages/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';

// ── Lazy-loaded pages ─────────────────────────────────
const Screen1 = lazy(() => import('./pages/onboarding/Screen1'));
const Screen2 = lazy(() => import('./pages/onboarding/Screen2'));
const Screen3 = lazy(() => import('./pages/onboarding/Screen3'));

const Terms = lazy(() => import('./pages/legal/Terms'));
const Privacy = lazy(() => import('./pages/legal/Privacy'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

const Home = lazy(() => import('./pages/home/Home'));
const PreTest = lazy(() => import('./pages/research/PreTest'));
const PostTest = lazy(() => import('./pages/research/PostTest'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Achievements = lazy(() => import('./pages/achievements/Achievements'));
const LigasPage = lazy(() => import('./pages/ligas/LigasPage'));

// ── Module overviews ──────────────────────────────────
const PresupuestoOverview = lazy(() => import('./pages/modules/presupuesto/Overview'));
const AhorroOverview = lazy(() => import('./pages/modules/ahorro/Overview'));
const InversionIndex = lazy(() => import('./pages/modules/inversion/Index'));
const InversionOverview = lazy(() => import('./pages/modules/inversion/Overview'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function RootGate() {
  // F7-ONBOARDING: puerta de entrada al primer uso (guest y sesión). Es el
  // punto real donde se decide entrar a /app desde la raíz: si aún no hizo
  // onboarding (userId 'local' sin sesión) va al flujo, si ya lo hizo entra.
  const user = useAuth((s) => s.user);
  const userId = user?.id ?? 'local';
  if (!isOnboarded(userId, user?.email)) {
    return <Navigate to="/onboarding/1" replace />;
  }
  return <Navigate to="/app" replace />;
}

export default function App() {
  const hasHydrated = useAuth((s) => s.hydrated);
  const online = useOnlineStatus();
  const [admin, setAdmin] = useState(isAdminMode());

  useEffect(() => {
    const handleAdminChange = () => setAdmin(isAdminMode());
    window.addEventListener('fe:admin-mode', handleAdminChange);
    return () => window.removeEventListener('fe:admin-mode', handleAdminChange);
  }, []);

  if (!hasHydrated) return <PageLoader />;

  return (
    <>
      {!online && <OfflineBanner dense />}
      {admin && <AdminBanner />}
      <GlobalSnackbar />
      <AchievementModal />
      <NewsletterPrompt />
      <NamePromptDialog />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Onboarding público */}
          <Route path="/onboarding/1" element={<Screen1 />} />
          <Route path="/onboarding/2" element={<Screen2 />} />
          <Route path="/onboarding/3" element={<Screen3 />} />

          {/* Auth público */}
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/research/pretest" element={<PreTest />} />
          <Route path="/research/posttest" element={<PostTest />} />

          {/* Legales público */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Raíz */}
          <Route path="/" element={<RootGate />} />

          {/* ZONA PRIVADA */}
          <Route element={<PrivateRoute />}>
            <Route path="/app" element={<Home />} />
            <Route path="/app/achievements" element={<Achievements />} />
            <Route path="/app/ligas" element={<LigasPage />} />
            <Route path="/app/profile" element={<Profile />} />
            <Route path="/app/settings" element={<Settings />} />

            {/* Overviews de módulos */}
            <Route path="/app/presupuesto" element={<PresupuestoOverview />} />
            <Route path="/app/ahorro" element={<AhorroOverview />} />
            <Route path="/app/inversion" element={<InversionIndex />} />
            <Route path="/app/inversion/overview" element={<InversionOverview />} />

            {/* Lecciones — ruta dinámica unificada */}
            <Route path="/app/:moduleId/lesson/:lessonId" element={<LessonWrapper />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
