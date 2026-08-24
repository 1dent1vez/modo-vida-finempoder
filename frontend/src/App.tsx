import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '@/shared/components/Spinner';
import { PrivateRoute } from './routes/PrivateRoute';
import { useAuth } from './store/auth';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import OfflineBanner from './components/OfflineBanner';
import GlobalSnackbar from './components/GlobalSnackbar';
import AdminBanner from './components/AdminBanner';
import { isAdminMode } from './lib/adminMode';
import { LessonWrapper } from '@/features/lessons/components/LessonWrapper';

// ── Auth (static — needed at first load) ──────────────
import LoginPage from './pages/auth/Login';
import AuthCallback from './pages/auth/AuthCallback';

// ── Lazy-loaded pages ─────────────────────────────────
const Screen1 = lazy(() => import('./pages/onboarding/Screen1'));
const Screen2 = lazy(() => import('./pages/onboarding/Screen2'));
const Screen3 = lazy(() => import('./pages/onboarding/Screen3'));

const Terms    = lazy(() => import('./pages/legal/Terms'));
const Privacy  = lazy(() => import('./pages/legal/Privacy'));
const AdminPage = lazy(() => import('./pages/admin/AdminPage'));

const Home         = lazy(() => import('./pages/home/Home'));
const PreTest      = lazy(() => import('./pages/research/PreTest'));
const PostTest     = lazy(() => import('./pages/research/PostTest'));
const Profile      = lazy(() => import('./pages/profile/Profile'));
const Settings     = lazy(() => import('./pages/settings/Settings'));
const Achievements = lazy(() => import('./pages/achievements/Achievements'));

// ── Module overviews ──────────────────────────────────
const PresupuestoOverview = lazy(() => import('./pages/modules/presupuesto/Overview'));
const AhorroOverview      = lazy(() => import('./pages/modules/ahorro/Overview'));
const InversionIndex      = lazy(() => import('./pages/modules/inversion/Index'));
const InversionOverview   = lazy(() => import('./pages/modules/inversion/Overview'));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function RootGate() {
  // Guest mode (Fase 0): la raíz siempre entra a /app. Sin sesión = invitado
  // (PrivateRoute + ResearchGate ya lo permiten); con sesión = usuario normal.
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
