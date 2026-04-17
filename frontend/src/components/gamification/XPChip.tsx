// FinEmpoder — XPChip
// Chip de experiencia (XP) para mostrar en AppBar y headers.

import { Chip } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';

export interface XPChipProps {
  xp: number;
}

export function XPChip({ xp }: XPChipProps) {
  if (xp <= 0) return null;

  return (
    <Chip
      icon={<BoltIcon sx={{ fontSize: '16px !important' }} />}
      label={`${xp} XP`}
      color="secondary"
      size="small"
      sx={{ fontWeight: 700, fontSize: '0.75rem' }}
    />
  );
}
