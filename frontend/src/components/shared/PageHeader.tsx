// FinEmpoder — PageHeader
// AppBar sticky reutilizable para todas las pantallas de la app.
// Reemplaza: Typography h5 ad-hoc en Logros/Perfil/Ajustes y AppBar transparente en Overviews.

import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import type { ReactNode } from 'react';

export interface PageHeaderProps {
  /** Título principal de la pantalla */
  title: string;
  /** Subtítulo opcional debajo del título */
  subtitle?: string;
  /** Si se pasa, renderiza IconButton ← a la izquierda */
  onBack?: () => void;
  /** Slot derecho libre: XPChip, StreakBadge u otro elemento */
  rightSlot?: ReactNode;
  /** Tinte de color por módulo (hereda el color del AppBar border-bottom) */
  moduleColor?: 'warning' | 'success' | 'info';
}

export function PageHeader({
  title,
  subtitle,
  onBack,
  rightSlot,
  moduleColor,
}: PageHeaderProps) {
  // Mapea moduleColor a un hex de borde (usa los tokens del sistema de diseño)
  const borderColorMap = {
    warning: '#F59E0B',
    success: '#10B981',
    info: '#4B73F0',
  } as const;

  const borderBottom = moduleColor
    ? `2px solid ${borderColorMap[moduleColor]}`
    : '1px solid #E5E7EB';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom,
      }}
    >
      <Toolbar sx={{ px: { xs: 1, sm: 2 }, minHeight: 56 }}>
        {/* Back button — solo si se proporciona onBack */}
        {onBack ? (
          <IconButton
            edge="start"
            onClick={onBack}
            aria-label="volver"
            sx={{ mr: 1, color: 'text.primary' }}
          >
            <ArrowBackIcon />
          </IconButton>
        ) : (
          // Spacer para mantener el layout balanceado en pantallas raíz
          <Box sx={{ width: 40, mr: 1, display: { md: 'none' } }} />
        )}

        {/* Título — centrado en móvil, izquierda en desktop */}
        <Box
          sx={{
            flex: 1,
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            noWrap
            sx={{ fontWeight: 700, lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', lineHeight: 1.3 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Slot derecho — XPChip, StreakBadge, etc. */}
        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {rightSlot ?? null}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
