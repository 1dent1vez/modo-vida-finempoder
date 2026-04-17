// FinEmpoder — BadgeCard
// Tarjeta de logro: desbloqueada (color completo) o bloqueada (gris + candado).

import { Box, Typography } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import FECard from '../FECard';
import type { Badge } from '../../data/badges';

export interface BadgeCardProps {
  badge: Badge;
  unlocked: boolean;
}

export function BadgeCard({ badge, unlocked }: BadgeCardProps) {
  return (
    <FECard
      variant="flat"
      sx={{
        p: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        filter: unlocked ? 'none' : 'grayscale(1)',
        opacity: unlocked ? 1 : 0.55,
        transition: 'all 200ms ease',
        position: 'relative',
      }}
    >
      {/* Ícono principal */}
      <Box sx={{ fontSize: '2.5rem', lineHeight: 1 }}>
        {unlocked ? badge.icon : <LockIcon sx={{ fontSize: 36, color: 'text.disabled' }} />}
      </Box>

      {/* Título */}
      <Typography
        variant="body2"
        fontWeight={700}
        color={unlocked ? 'text.primary' : 'text.disabled'}
        sx={{ lineHeight: 1.3 }}
      >
        {badge.title}
      </Typography>

      {/* Descripción o pista */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1.4, display: 'block' }}
      >
        {unlocked ? badge.description : badge.hint}
      </Typography>
    </FECard>
  );
}
