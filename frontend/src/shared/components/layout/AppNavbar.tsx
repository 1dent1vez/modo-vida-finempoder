import { Home, Trophy, User, Settings } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
  path: string;
};

const items: NavItem[] = [
  { label: 'Inicio', Icon: Home, path: '/app' },
  { label: 'Logros', Icon: Trophy, path: '/app/achievements' },
  { label: 'Perfil', Icon: User, path: '/app/profile' },
  { label: 'Ajustes', Icon: Settings, path: '/app/settings' },
];

export function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const current = useMemo(
    () => items.findIndex((i) => location.pathname.startsWith(i.path)),
    [location.pathname]
  );

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed bottom-0 left-0 right-0 z-[1200] flex h-16 items-end bg-white shadow-[0_-1px_0_0_var(--color-neutral-200)]"
    >
      {items.map((item, idx) => {
        const active = current === idx;
        return (
          <button
            key={item.path}
            aria-label={item.label}
            aria-current={active ? 'page' : undefined}
            onClick={() => navigate(item.path)}
            className={cn(
              'flex flex-1 flex-col items-center justify-end pb-2 pt-1 gap-0.5 transition-colors',
              active
                ? 'text-[var(--color-brand-primary)]'
                : 'text-[var(--color-neutral-400)] hover:text-[var(--color-neutral-700)]'
            )}
          >
            <item.Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium leading-none">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
