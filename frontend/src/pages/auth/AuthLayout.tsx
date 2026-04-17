// FinEmpoder — AuthLayout
// Shell compartido para Login y SignUp: logo + header + contenedor centrado + footer legal.

import { Box, Link, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import logo from '../../assets/Logo.png';

interface AuthLayoutProps {
  /** Enlace alternativo a la derecha del header (ej. "Registrarse" o "Acceder") */
  headerLink?: ReactNode;
  children: ReactNode;
}

export default function AuthLayout({ headerLink, children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        minHeight: '100svh',
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        px: 3,
        pt: `calc(12px + env(safe-area-inset-top))`,
        pb: `calc(12px + env(safe-area-inset-bottom))`,
      }}
    >
      {/* ── Header: logo + enlace alternativo ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            component="img"
            src={logo}
            alt="FinEmpoder"
            sx={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
          />
          <Typography fontWeight={700}>FinEmpoder</Typography>
        </Stack>
        {headerLink}
      </Stack>

      {/* ── Contenido (formulario) ── */}
      <Stack spacing={2} sx={{ maxWidth: 420, mx: 'auto', width: '100%', mt: 3 }}>
        {children}
      </Stack>

      {/* ── Footer legal ── */}
      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
        Al usar FinEmpoder aceptas los{' '}
        <Link component={RouterLink} to="/terms" underline="none" sx={{ color: 'warning.dark' }}>
          Términos y Condiciones
        </Link>{' '}
        y la{' '}
        <Link component={RouterLink} to="/privacy" underline="none" sx={{ color: 'warning.dark' }}>
          Política de Privacidad
        </Link>
        .
      </Typography>
    </Box>
  );
}
