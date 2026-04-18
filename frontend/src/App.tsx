import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

import { PrivateRoute } from './routes/PrivateRoute';
import { useAuth } from './store/auth';
import { useOnlineStatus } from '@/shared/hooks/useOnlineStatus';
import OfflineBanner from './components/OfflineBanner';
import GlobalSnackbar from './components/GlobalSnackbar';

// ── Auth (static — needed at first load) ──────────────
import LoginPage from './pages/auth/Login';
import SignUpPage from './pages/auth/SignUp';

// ── Lazy-loaded pages ─────────────────────────────────
const Screen1 = lazy(() => import('./pages/onboarding/Screen1'));
const Screen2 = lazy(() => import('./pages/onboarding/Screen2'));
const Screen3 = lazy(() => import('./pages/onboarding/Screen3'));

const Terms    = lazy(() => import('./pages/legal/Terms'));
const Privacy  = lazy(() => import('./pages/legal/Privacy'));

const Home         = lazy(() => import('./pages/home/Home'));
const PreTest      = lazy(() => import('./pages/research/PreTest'));
const PostTest     = lazy(() => import('./pages/research/PostTest'));
const Profile      = lazy(() => import('./pages/profile/Profile'));
const Settings     = lazy(() => import('./pages/settings/Settings'));
const Achievements = lazy(() => import('./pages/achievements/Achievements'));

// ── Presupuesto ───────────────────────────────────────
const PresupuestoOverview = lazy(() => import('./pages/modules/presupuesto/Overview'));
const L01 = lazy(() => import('./pages/modules/presupuesto/lessons/L01'));
const L02 = lazy(() => import('./pages/modules/presupuesto/lessons/L02'));
const L03 = lazy(() => import('./pages/modules/presupuesto/lessons/L03'));
const L04 = lazy(() => import('./pages/modules/presupuesto/lessons/L04'));
const L05 = lazy(() => import('./pages/modules/presupuesto/lessons/L05'));
const L06 = lazy(() => import('./pages/modules/presupuesto/lessons/L06'));
const L07 = lazy(() => import('./pages/modules/presupuesto/lessons/L07'));
const L08 = lazy(() => import('./pages/modules/presupuesto/lessons/L08'));
const L09 = lazy(() => import('./pages/modules/presupuesto/lessons/L09'));
const L10 = lazy(() => import('./pages/modules/presupuesto/lessons/L10'));
const L11 = lazy(() => import('./pages/modules/presupuesto/lessons/L11'));
const L12 = lazy(() => import('./pages/modules/presupuesto/lessons/L12'));
const L13 = lazy(() => import('./pages/modules/presupuesto/lessons/L13'));
const L14 = lazy(() => import('./pages/modules/presupuesto/lessons/L14'));
const L15 = lazy(() => import('./pages/modules/presupuesto/lessons/L15'));

// ── Ahorro ────────────────────────────────────────────
const AhorroOverview = lazy(() => import('./pages/modules/ahorro/Overview'));
const AhorroL01 = lazy(() => import('./pages/modules/ahorro/lessons/L01'));
const AhorroL02 = lazy(() => import('./pages/modules/ahorro/lessons/L02'));
const AhorroL03 = lazy(() => import('./pages/modules/ahorro/lessons/L03'));
const AhorroL04 = lazy(() => import('./pages/modules/ahorro/lessons/L04'));
const AhorroL05 = lazy(() => import('./pages/modules/ahorro/lessons/L05'));
const AhorroL06 = lazy(() => import('./pages/modules/ahorro/lessons/L06'));
const AhorroL07 = lazy(() => import('./pages/modules/ahorro/lessons/L07'));
const AhorroL08 = lazy(() => import('./pages/modules/ahorro/lessons/L08'));
const AhorroL09 = lazy(() => import('./pages/modules/ahorro/lessons/L09'));
const AhorroL10 = lazy(() => import('./pages/modules/ahorro/lessons/L10'));
const AhorroL11 = lazy(() => import('./pages/modules/ahorro/lessons/L11'));
const AhorroL12 = lazy(() => import('./pages/modules/ahorro/lessons/L12'));
const AhorroL13 = lazy(() => import('./pages/modules/ahorro/lessons/L13'));
const AhorroL14 = lazy(() => import('./pages/modules/ahorro/lessons/L14'));
const AhorroL15 = lazy(() => import('./pages/modules/ahorro/lessons/L15'));

// ── Inversión ─────────────────────────────────────────
const InversionIndex    = lazy(() => import('./pages/modules/inversion/Index'));
const InvestmentOverview = lazy(() => import('./pages/modules/inversion/Overview'));
const InvL01 = lazy(() => import('./pages/modules/inversion/lessons/L01'));
const InvL02 = lazy(() => import('./pages/modules/inversion/lessons/L02'));
const InvL03 = lazy(() => import('./pages/modules/inversion/lessons/L03'));
const InvL04 = lazy(() => import('./pages/modules/inversion/lessons/L04'));
const InvL05 = lazy(() => import('./pages/modules/inversion/lessons/L05'));
const InvL06 = lazy(() => import('./pages/modules/inversion/lessons/L06'));
const InvL07 = lazy(() => import('./pages/modules/inversion/lessons/L07'));
const InvL08 = lazy(() => import('./pages/modules/inversion/lessons/L08'));
const InvL09 = lazy(() => import('./pages/modules/inversion/lessons/L09'));
const InvL10 = lazy(() => import('./pages/modules/inversion/lessons/L10'));
const InvL11 = lazy(() => import('./pages/modules/inversion/lessons/L11'));
const InvL12 = lazy(() => import('./pages/modules/inversion/lessons/L12'));
const InvL13 = lazy(() => import('./pages/modules/inversion/lessons/L13'));
const InvL14 = lazy(() => import('./pages/modules/inversion/lessons/L14'));
const InvL15 = lazy(() => import('./pages/modules/inversion/lessons/L15'));

// ── Loading spinner ───────────────────────────────────
function PageLoader() {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
      <CircularProgress />
    </Box>
  );
}

// Si hay token -> App; de lo contrario -> Login
function RootGate() {
  const token = useAuth((s) => s.token);
  return token ? <Navigate to="/app" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  const hasHydrated = useAuth((s) => s.hydrated);
  const online = useOnlineStatus();

  if (!hasHydrated) return <PageLoader />;

  return (
    <>
      {!online && <OfflineBanner dense />}
      <GlobalSnackbar />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Onboarding publico */}
          <Route path="/onboarding/1" element={<Screen1 />} />
          <Route path="/onboarding/2" element={<Screen2 />} />
          <Route path="/onboarding/3" element={<Screen3 />} />

          {/* Auth publico */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/research/pretest" element={<PreTest />} />
          <Route path="/research/posttest" element={<PostTest />} />

          {/* Legales publico */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />

          {/* Raiz */}
          <Route path="/" element={<RootGate />} />

          {/* ZONA PRIVADA */}
          <Route element={<PrivateRoute />}>
            <Route path="/app" element={<Home />} />
            <Route path="/app/achievements" element={<Achievements />} />
            <Route path="/app/profile" element={<Profile />} />
            <Route path="/app/settings" element={<Settings />} />

            {/* Modulo Presupuesto */}
            <Route path="/app/presupuesto" element={<PresupuestoOverview />} />
            <Route path="/app/presupuesto/lesson/L01" element={<L01 />} />
            <Route path="/app/presupuesto/lesson/L02" element={<L02 />} />
            <Route path="/app/presupuesto/lesson/L03" element={<L03 />} />
            <Route path="/app/presupuesto/lesson/L04" element={<L04 />} />
            <Route path="/app/presupuesto/lesson/L05" element={<L05 />} />
            <Route path="/app/presupuesto/lesson/L06" element={<L06 />} />
            <Route path="/app/presupuesto/lesson/L07" element={<L07 />} />
            <Route path="/app/presupuesto/lesson/L08" element={<L08 />} />
            <Route path="/app/presupuesto/lesson/L09" element={<L09 />} />
            <Route path="/app/presupuesto/lesson/L10" element={<L10 />} />
            <Route path="/app/presupuesto/lesson/L11" element={<L11 />} />
            <Route path="/app/presupuesto/lesson/L12" element={<L12 />} />
            <Route path="/app/presupuesto/lesson/L13" element={<L13 />} />
            <Route path="/app/presupuesto/lesson/L14" element={<L14 />} />
            <Route path="/app/presupuesto/lesson/L15" element={<L15 />} />

            {/* Modulo Inversion */}
            <Route path="/app/inversion" element={<InversionIndex />} />
            <Route path="/app/inversion/overview" element={<InvestmentOverview />} />
            <Route path="/app/inversion/lesson/L01" element={<InvL01 />} />
            <Route path="/app/inversion/lesson/L02" element={<InvL02 />} />
            <Route path="/app/inversion/lesson/L03" element={<InvL03 />} />
            <Route path="/app/inversion/lesson/L04" element={<InvL04 />} />
            <Route path="/app/inversion/lesson/L05" element={<InvL05 />} />
            <Route path="/app/inversion/lesson/L06" element={<InvL06 />} />
            <Route path="/app/inversion/lesson/L07" element={<InvL07 />} />
            <Route path="/app/inversion/lesson/L08" element={<InvL08 />} />
            <Route path="/app/inversion/lesson/L09" element={<InvL09 />} />
            <Route path="/app/inversion/lesson/L10" element={<InvL10 />} />
            <Route path="/app/inversion/lesson/L11" element={<InvL11 />} />
            <Route path="/app/inversion/lesson/L12" element={<InvL12 />} />
            <Route path="/app/inversion/lesson/L13" element={<InvL13 />} />
            <Route path="/app/inversion/lesson/L14" element={<InvL14 />} />
            <Route path="/app/inversion/lesson/L15" element={<InvL15 />} />

            {/* Modulo Ahorro */}
            <Route path="/app/ahorro" element={<AhorroOverview />} />
            <Route path="/app/ahorro/lesson/L01" element={<AhorroL01 />} />
            <Route path="/app/ahorro/lesson/L02" element={<AhorroL02 />} />
            <Route path="/app/ahorro/lesson/L03" element={<AhorroL03 />} />
            <Route path="/app/ahorro/lesson/L04" element={<AhorroL04 />} />
            <Route path="/app/ahorro/lesson/L05" element={<AhorroL05 />} />
            <Route path="/app/ahorro/lesson/L06" element={<AhorroL06 />} />
            <Route path="/app/ahorro/lesson/L07" element={<AhorroL07 />} />
            <Route path="/app/ahorro/lesson/L08" element={<AhorroL08 />} />
            <Route path="/app/ahorro/lesson/L09" element={<AhorroL09 />} />
            <Route path="/app/ahorro/lesson/L10" element={<AhorroL10 />} />
            <Route path="/app/ahorro/lesson/L11" element={<AhorroL11 />} />
            <Route path="/app/ahorro/lesson/L12" element={<AhorroL12 />} />
            <Route path="/app/ahorro/lesson/L13" element={<AhorroL13 />} />
            <Route path="/app/ahorro/lesson/L14" element={<AhorroL14 />} />
            <Route path="/app/ahorro/lesson/L15" element={<AhorroL15 />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
