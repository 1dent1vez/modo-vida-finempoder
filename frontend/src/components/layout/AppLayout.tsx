import { Box } from '@mui/material';
import { AppNavbar } from './AppNavbar';

const skipLinkStyles = {
  position: 'absolute',
  left: '-9999px',
  top: '0',
  zIndex: 9999,
  padding: '8px 16px',
  backgroundColor: 'primary.main',
  color: 'primary.contrastText',
  '&:focus': { left: '8px', top: '8px' },
} as const;

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: '100vh', pb: { xs: 8, sm: 8 } }}>
      <Box component="a" href="#main-content" sx={skipLinkStyles}>
        Saltar al contenido
      </Box>
      <Box component="main" id="main-content" tabIndex={-1}>
        {children}
      </Box>
      <AppNavbar />
    </Box>
  );
}
