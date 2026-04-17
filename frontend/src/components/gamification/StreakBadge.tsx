// FinEmpoder — StreakBadge
// Badge de racha diaria. Solo renderiza si streak >= 2.

import { Chip } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

export interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak < 2) return null;

  return (
    <Chip
      icon={<LocalFireDepartmentIcon sx={{ fontSize: '16px !important' }} />}
      label={`${streak} días`}
      color="warning"
      size="small"
      sx={{ fontWeight: 700, fontSize: '0.75rem' }}
    />
  );
}
