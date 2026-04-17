import { useMemo } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  LinearProgress,
  Button,
  Avatar,
} from '@mui/material';
import SavingsIcon from '@mui/icons-material/Savings';
import SchoolIcon from '@mui/icons-material/School';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../store/progress';
import { useAuth } from '../../store/auth';
import { useGamification } from '../../hooks/gamification/useGamification';
import FECard from '../../components/FECard';
import { StatCard } from '../../components/shared/StatCard';
import { XPChip, StreakBadge } from '../../components/gamification';
import {
  getLessonPath,
  getProgressPercent,
  loadModuleProgressSnapshot,
} from '../../module-kit/moduleFlow';
import { BUDGET_MODULE_CONFIG } from '../modules/presupuesto/lessonFlow';
import { SAVINGS_MODULE_CONFIG } from '../modules/ahorro/lessonFlow';
import { INVESTMENT_MODULE_CONFIG } from '../modules/inversion/lessonFlow';

/* ─── Tips diarios ───────────────────────────────────────── */
const DAILY_TIPS = [
  'Separa el 10% de tu ingreso antes de gastar. Paga primero a tu yo futuro.',
  'El gasto hormiga suma más de lo que crees: un café diario = $1,500 al mes.',
  'La regla 50-30-20: 50% necesidades, 30% deseos, 20% ahorro e inversión.',
  'Un fondo de emergencia de 3-6 meses de gastos es tu escudo financiero.',
  'Antes de invertir, elimina deudas con tasas mayores al 15% anual.',
  'Anota cada gasto hoy. En una semana verás patrones que no esperabas.',
  'La inflación reduce el poder de tu dinero. Invertirlo lo protege.',
  'Automatiza tu ahorro: transfiérelo el día que cobras, no lo que sobre.',
  'Diversificar es no poner todos los huevos en una canasta.',
  'El interés compuesto es magia: $1,000 al 10% anual = $2,594 en 10 años.',
  'Define tu meta de ahorro con monto y fecha límite. Sin fecha, no es meta.',
  'Revisa tus suscripciones cada mes. Las olvidadas cuestan más de $500/año.',
  'El mejor momento para empezar a invertir fue ayer. El segundo mejor es hoy.',
  'Conoce tu perfil de riesgo antes de elegir instrumento de inversión.',
];

function getDailyTip(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

/* ─── Helpers de continuación ────────────────────────────── */
type ModuleContinue = {
  path: string;
  lessonTitle: string;
  moduleTitle: string;
  color: 'warning' | 'success' | 'info';
  progress: number;
};

function computeContinueCards(): ModuleContinue[] {
  const modules: Array<{
    config: typeof BUDGET_MODULE_CONFIG | typeof SAVINGS_MODULE_CONFIG | typeof INVESTMENT_MODULE_CONFIG;
    moduleTitle: string;
    color: 'warning' | 'success' | 'info';
  }> = [
    { config: BUDGET_MODULE_CONFIG, moduleTitle: 'Presupuestación', color: 'warning' },
    { config: SAVINGS_MODULE_CONFIG, moduleTitle: 'Ahorro', color: 'success' },
    { config: INVESTMENT_MODULE_CONFIG, moduleTitle: 'Inversión', color: 'info' },
  ];

  const results: ModuleContinue[] = [];
  for (const { config, moduleTitle, color } of modules) {
    const snapshot = loadModuleProgressSnapshot(config);
    const progress = getProgressPercent(config, snapshot);
    const next = (config.lessons as ReadonlyArray<{ id: string; title: string; kind: string }>)
      .find((l) => snapshot.lessons[l.id] !== 'completed');
    if (!next) continue;
    results.push({
      path: getLessonPath(config, next.id),
      lessonTitle: next.title,
      moduleTitle,
      color,
      progress,
    });
  }
  return results.sort((a, b) => b.progress - a.progress); // módulo más avanzado primero
}

function computeTotalCompleted(): number {
  const configs = [BUDGET_MODULE_CONFIG, SAVINGS_MODULE_CONFIG, INVESTMENT_MODULE_CONFIG];
  return configs.reduce((total, config) => {
    const snapshot = loadModuleProgressSnapshot(config);
    const completed = Object.values(snapshot.lessons).filter((s) => s === 'completed').length;
    return total + completed;
  }, 0);
}

/* ─── Sub-componentes ────────────────────────────────────── */

type ModuleCardProps = {
  title: string;
  subtitle: string;
  progress: number;
  color: 'warning' | 'success' | 'info';
  icon: React.ReactNode;
  onOpen: () => void;
};

function ModuleCard({ title, subtitle, progress, color, icon, onOpen }: ModuleCardProps) {
  return (
    <FECard variant="elevated" clickable sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={3} sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight={700}>{title}</Typography>
          <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        </Box>
      </Stack>
      <LinearProgress variant="determinate" value={progress} color={color} sx={{ mb: 1 }} />
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption" color="text.secondary">
          {progress}% completado
        </Typography>
        <Button variant="contained" size="small" color={color} onClick={onOpen}>
          Ir
        </Button>
      </Stack>
    </FECard>
  );
}

/* ─── Home principal ─────────────────────────────────────── */

export default function Home() {
  const nav = useNavigate();
  const mod = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { user } = useAuth();
  const { data: gamification } = useGamification();

  const continueCards = useMemo(() => computeContinueCards(), []);
  const totalCompleted = useMemo(() => computeTotalCompleted(), []);
  const primaryContinue = continueCards[0] ?? null;

  const displayName = user?.name
    ? user.name.split(' ')[0]
    : user?.email?.split('@')[0] ?? 'Estudiante';

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <Box sx={{ p: { xs: 4, md: 6 }, pb: 20, bgcolor: 'background.default', minHeight: '100vh' }}>

      {/* ── 1. Greeting Header ──────────────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 5 }}
      >
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            {displayName[0]?.toUpperCase() ?? 'U'}
          </Avatar>
          <Box>
            <Typography variant="h2" fontWeight={800}>
              Hola, {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              {today}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {gamification && <XPChip xp={gamification.xp} />}
          <StreakBadge streak={streak.current} />
        </Stack>
      </Stack>

      {/* ── 2. ContinueCard (módulo más avanzado) ───────────── */}
      {primaryContinue && (
        <FECard
          variant="hero"
          sx={{
            mb: 5,
            bgcolor: `${primaryContinue.color}.light`,
            border: 2,
            borderColor: `${primaryContinue.color}.main`,
          }}
        >
          <Typography variant="overline" color={`${primaryContinue.color}.dark`}>
            {primaryContinue.moduleTitle} · {primaryContinue.progress}% completado
          </Typography>
          <Typography variant="h3" fontWeight={700} sx={{ mt: 0.5, mb: 3 }} noWrap>
            {primaryContinue.lessonTitle}
          </Typography>
          <Button
            variant="contained"
            color={primaryContinue.color}
            size="large"
            fullWidth
            startIcon={<PlayArrowIcon />}
            onClick={() => nav(primaryContinue.path)}
          >
            Ir ahora
          </Button>
        </FECard>
      )}

      {/* ── 3. Tus módulos ──────────────────────────────────── */}
      <Typography variant="h3" fontWeight={700} sx={{ mb: 3 }}>
        Tus módulos
      </Typography>
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModuleCard
            title="Presupuestación"
            subtitle="Organiza ingresos y gastos"
            progress={mod.presupuesto?.progress ?? 0}
            color="warning"
            icon={<SavingsIcon />}
            onOpen={() => nav('/app/presupuesto')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModuleCard
            title="Ahorro"
            subtitle="Crea hábitos de ahorro"
            progress={mod.ahorro?.progress ?? 0}
            color="success"
            icon={<SchoolIcon />}
            onOpen={() => nav('/app/ahorro')}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ModuleCard
            title="Inversión"
            subtitle="Haz crecer tu dinero"
            progress={mod.inversion?.progress ?? 0}
            color="info"
            icon={<ShowChartIcon />}
            onOpen={() => nav('/app/inversion')}
          />
        </Grid>
      </Grid>

      {/* ── 4. Stats Row ────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 5 }}>
        <Grid size={{ xs: 4 }}>
          <StatCard
            icon={<MenuBookIcon />}
            label="Lecciones"
            value={totalCompleted}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard
            icon={<LocalFireDepartmentIcon />}
            label="Racha"
            value={`${streak.current}d`}
            color="warning"
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <StatCard
            icon={<EmojiEventsIcon />}
            label="XP"
            value={gamification?.xp ?? 0}
            color="success"
          />
        </Grid>
      </Grid>

      {/* ── 5. Daily Tip ────────────────────────────────────── */}
      <FECard variant="flat">
        <Stack direction="row" spacing={3} alignItems="flex-start">
          <LightbulbIcon color="warning" sx={{ mt: 0.5, flexShrink: 0 }} />
          <Box>
            <Typography variant="body2" fontWeight={700} sx={{ mb: 0.5 }}>
              Tip del día
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getDailyTip()}
            </Typography>
          </Box>
        </Stack>
      </FECard>

    </Box>
  );
}
