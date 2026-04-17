// FinEmpoder — StatCard
// Tarjeta de estadística reutilizable: icono + valor grande + label.
// Reemplaza los Paper ad-hoc de Logros, Perfil y Home.

import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import FECard from '../FECard';

export interface StatCardProps {
  /** Ícono MUI u otro ReactNode */
  icon: ReactNode;
  /** Etiqueta descriptiva debajo del valor */
  label: string;
  /** Valor numérico o texto a mostrar prominentemente */
  value: string | number;
  /** Color semántico del ícono y valor */
  color?: 'primary' | 'warning' | 'success' | 'info';
  /** Tamaño de la tarjeta (default: md) */
  size?: 'sm' | 'md';
}

const sizeTokens = {
  sm: { iconSize: 20, valueFontSize: '1.25rem', p: 3 },
  md: { iconSize: 28, valueFontSize: '1.75rem', p: 4 },
} as const;

export function StatCard({
  icon,
  label,
  value,
  color = 'primary',
  size = 'md',
}: StatCardProps) {
  const { iconSize, valueFontSize, p } = sizeTokens[size];

  return (
    <FECard
      variant="flat"
      sx={{ p, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
    >
      {/* Ícono con color semántico */}
      <Box
        sx={{
          color: `${color}.main`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& .MuiSvgIcon-root': { fontSize: iconSize },
        }}
      >
        {icon}
      </Box>

      {/* Valor principal */}
      <Typography
        component="span"
        sx={{
          fontSize: valueFontSize,
          fontWeight: 800,
          lineHeight: 1.1,
          color: `${color}.main`,
        }}
      >
        {value}
      </Typography>

      {/* Etiqueta */}
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
        {label}
      </Typography>
    </FECard>
  );
}
