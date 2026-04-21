import { Home, Trophy, User, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type NavItem = { label: string; icon: React.ReactNode; path: string };

const items: NavItem[] = [
  { label: 'Inicio',  icon: <Home size={22} />,    path: '/app' },
  { label: 'Logros',  icon: <Trophy size={22} />,  path: '/app/achievements' },
  { label: 'Perfil',  icon: <User size={22} />,    path: '/app/profile' },
  { label: 'Ajustes', icon: <Settings size={22} />, path: '/app/settings' },
];

export function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const current = useMemo(() => {
    const found = items.findIndex((i) => location.pathname.startsWith(i.path));
    return found === -1 ? 0 : found;
  }, [location.pathname]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[1200] bg-white border-t border-[var(--color-neutral-200)] shadow-[0_-2px_8px_rgba(0,0,0,0.08)]"
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch">
        {items.map((item, idx) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={current === idx ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors',
              current === idx
                ? 'text-[var(--color-brand-primary)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            )}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
