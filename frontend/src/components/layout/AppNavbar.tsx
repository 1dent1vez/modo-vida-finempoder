import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

type NavItem = {
  label: string;
  icon: React.ReactElement;
  path: string;
};

const items: NavItem[] = [
  { label: 'Inicio', icon: <HomeIcon />, path: '/app' },
  { label: 'Logros', icon: <EmojiEventsIcon />, path: '/app/achievements' },
  { label: 'Perfil', icon: <PersonIcon />, path: '/app/profile' },
  { label: 'Ajustes', icon: <SettingsIcon />, path: '/app/settings' },
];

export function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const current = useMemo(() => {
    const found = items.findIndex((i) => location.pathname.startsWith(i.path));
    return found === -1 ? 0 : found;
  }, [location.pathname]);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1200,
        boxShadow: (t) => t.shadows[8],
      }}
      role="navigation"
      aria-label="Navegación principal"
    >
      <BottomNavigation
        showLabels
        value={current}
        onChange={(_e, idx) => {
          const item = items[idx];
          if (item) navigate(item.path);
        }}
      >
        {items.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={item.icon}
            aria-label={item.label}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

