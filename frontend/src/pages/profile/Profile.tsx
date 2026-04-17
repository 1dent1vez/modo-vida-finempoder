// FinEmpoder — Profile (Rediseño)
// PageHeader + hero Avatar + info + stats + logout.

import { Avatar, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import { StatCard } from '../../components/shared/StatCard';
import FECard from '../../components/FECard';
import { useAuth } from '../../store/auth';
import { useProgress } from '../../store/progress';
import { useGamification } from '../../hooks/gamification/useGamification';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const modules = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { data: gamification } = useGamification();

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const streakCurrent = streak.current ?? 0;

  // Letras iniciales del nombre (o email como fallback)
  const displayName = user?.name ?? 'Estudiante FinEmpoder';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  // Total de lecciones completadas (aprox por % de módulos, 15 por módulo)
  const presupuestoProgress = modules.presupuesto?.progress ?? 0;
  const ahorroProgress = modules.ahorro?.progress ?? 0;
  const inversionProgress = modules.inversion?.progress ?? 0;
  const totalCompleted = Math.round(
    ((presupuestoProgress + ahorroProgress + inversionProgress) / 100) * 15
  );

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader title="Mi perfil" />

      <Box sx={{ p: 2 }}>
        {/* ── Hero: Avatar + nombre + nivel ── */}
        <FECard variant="hero" sx={{ mb: 2, textAlign: 'center' }}>
          <Stack alignItems="center" spacing={2}>
            <Avatar
              sx={{
                width: 80,
                height: 80,
                bgcolor: 'secondary.main',
                color: 'common.white',
                fontSize: '2rem',
                fontWeight: 800,
              }}
            >
              {initials || '?'}
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight={800} sx={{ mb: 0.5 }}>
                {displayName}
              </Typography>
              <Chip
                label={`Nivel ${level}`}
                color="secondary"
                size="small"
                icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />}
                sx={{ fontWeight: 700 }}
              />
            </Box>
          </Stack>
        </FECard>

        {/* ── Información ── */}
        <FECard variant="flat" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 2 }}>
            Información
          </Typography>
          <Stack spacing={1.5}>
            <InfoRow label="Correo electrónico" value={user?.email ?? '—'} />
            <InfoRow label="Nombre" value={user?.name ?? '—'} />
          </Stack>
        </FECard>

        {/* ── Estadísticas ── */}
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
          Mis estadísticas
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 4 }}>
            <StatCard
              icon={<EmojiEventsIcon />}
              label="Lecciones"
              value={totalCompleted}
              color="primary"
              size="sm"
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <StatCard
              icon={<LocalFireDepartmentIcon />}
              label="Racha"
              value={`${streakCurrent}d`}
              color="warning"
              size="sm"
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <StatCard
              icon={<BoltIcon />}
              label="XP"
              value={xp}
              color="info"
              size="sm"
            />
          </Grid>
        </Grid>

        {/* ── Cerrar sesión ── */}
        <Button
          variant="outlined"
          color="error"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </Button>
      </Box>
    </Box>
  );
}

/* ── Helper local ── */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}
