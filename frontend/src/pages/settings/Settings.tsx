// FinEmpoder — Settings (Rediseño)
// PageHeader + FECards: Cuenta / Datos y privacidad / Sesión.

import { Box, Button, Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/shared/PageHeader';
import FECard from '../../components/FECard';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';

const APP_VERSION = '1.0.0';

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  return (
    <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageHeader title="Ajustes" />

      <Box sx={{ p: 2 }}>
        {/* ── Cuenta ── */}
        <FECard variant="flat" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Cuenta
          </Typography>
          <List disablePadding>
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary={<Typography variant="body2" color="text.secondary">Correo electrónico</Typography>}
                secondary={<Typography variant="body1" fontWeight={500}>{user?.email ?? '—'}</Typography>}
              />
            </ListItem>
            <Divider />
            <ListItem disablePadding sx={{ py: 1 }}>
              <ListItemText
                primary={<Typography variant="body2" color="text.secondary">Versión de la app</Typography>}
                secondary={<Typography variant="body1" fontWeight={500}>v{APP_VERSION}</Typography>}
              />
            </ListItem>
          </List>
        </FECard>

        {/* ── Datos y privacidad ── */}
        <FECard variant="flat" sx={{ mb: 2 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Datos y privacidad
          </Typography>
          <List disablePadding>
            <ListItem
              disablePadding
              sx={{ py: 1 }}
              component={Link}
              to="/terms"
            >
              <ListItemText
                primary={
                  <Typography variant="body1" color="primary.main" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Términos y condiciones
                    <OpenInNewIcon sx={{ fontSize: 14 }} />
                  </Typography>
                }
              />
            </ListItem>
            <Divider />
            <ListItem
              disablePadding
              sx={{ py: 1 }}
              component={Link}
              to="/privacy"
            >
              <ListItemText
                primary={
                  <Typography variant="body1" color="primary.main" fontWeight={500} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    Política de privacidad
                    <OpenInNewIcon sx={{ fontSize: 14 }} />
                  </Typography>
                }
              />
            </ListItem>
          </List>
        </FECard>

        {/* ── Sesión ── */}
        <FECard variant="flat">
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1.5 }}>
            Sesión
          </Typography>
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
        </FECard>
      </Box>
    </Box>
  );
}
