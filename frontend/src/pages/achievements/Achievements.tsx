// FinEmpoder — Achievements (Rediseño)
// PageHeader + StatCards + progreso por módulo + grid de badges.

import { Box, Chip, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import { BadgeCard } from '../../components/gamification/BadgeCard';
import { XPChip } from '../../components/gamification/XPChip';
import { StreakBadge } from '../../components/gamification/StreakBadge';
import FECard from '../../components/FECard';
import { useGamification } from '../../hooks/gamification/useGamification';
import { useProgress } from '../../store/progress';
import { useResearchStatus } from '../../hooks/research/useResearchStatus';
import { BADGES } from '../../data/badges';
import type { BadgeStats } from '../../data/badges';
import { MODULE_COLORS } from '../../theme';

const MODULE_LABELS: Record<string, string> = {
  presupuesto: 'Presupuestación',
  ahorro: 'Ahorro',
  inversion: 'Inversión',
};

export default function Achievements() {
  const { data: gamification } = useGamification();
  const modules = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { data: research } = useResearchStatus();

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const streakCurrent = streak.current ?? 0;
  const streakBest = streak.best ?? 0;

  const presupuestoProgress = modules.presupuesto?.progress ?? 0;
  const ahorroProgress = modules.ahorro?.progress ?? 0;
  const inversionProgress = modules.inversion?.progress ?? 0;

  // Totalizar lecciones completadas aproximadas (sumando los 3 módulos, 15 lecciones c/u)
  const totalCompleted = Math.round(
    ((presupuestoProgress + ahorroProgress + inversionProgress) / 100) * 15
  );

  const badgeStats: BadgeStats = {
    totalCompleted,
    presupuestoProgress,
    ahorroProgress,
    inversionProgress,
    streakBest,
    streakCurrent,
    preDone: research?.preDone ?? false,
    postDone: research?.postDone ?? false,
  };

  const unlockedCount = BADGES.filter((b) => b.condition(badgeStats)).length;

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader
        title="Logros"
        subtitle={`${unlockedCount} de ${BADGES.length} desbloqueados`}
        rightSlot={
          <>
            <XPChip xp={xp} />
            <StreakBadge streak={streakCurrent} />
          </>
        }
      />

      <Box sx={{ p: 2 }}>
        {/* ── Stats Row ── */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<EmojiEventsIcon />}
              label="Nivel"
              value={level}
              color="warning"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<BoltIcon />}
              label="XP total"
              value={xp}
              color="primary"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<LocalFireDepartmentIcon />}
              label="Racha actual"
              value={`${streakCurrent}d`}
              color="info"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <StatCard
              icon={<WhatshotIcon />}
              label="Mejor racha"
              value={`${streakBest}d`}
              color="success"
            />
          </Grid>
        </Grid>

        {/* ── Progreso por módulo ── */}
        <FECard variant="flat" sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Progreso por módulo
          </Typography>
          <Stack spacing={2}>
            {(['presupuesto', 'ahorro', 'inversion'] as const).map((mod) => {
              const pct = modules[mod]?.progress ?? 0;
              const color = MODULE_COLORS[mod];
              return (
                <Box key={mod}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {MODULE_LABELS[mod]}
                    </Typography>
                    {pct >= 100 ? (
                      <Chip label="Completado" color="success" size="small" />
                    ) : (
                      <Chip label={`${pct}%`} color={color} size="small" />
                    )}
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    color={color}
                    sx={{ height: 8, borderRadius: 4, bgcolor: 'grey.100' }}
                  />
                </Box>
              );
            })}
          </Stack>
        </FECard>

        {/* ── Grid de badges ── */}
        <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
          Mis logros
        </Typography>
        <Grid container spacing={2}>
          {BADGES.map((badge) => (
            <Grid key={badge.id} size={{ xs: 6, sm: 4, md: 3 }}>
              <BadgeCard badge={badge} unlocked={badge.condition(badgeStats)} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
