import { LogOut, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import FECard from '../../shared/components/FECard';
import { Button } from '../../shared/components/ui/button';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import {
  DAILY_GOAL_META,
  DAILY_GOAL_ORDER,
  DAILY_GOAL_XP,
  DEFAULT_DAILY_LEVEL,
  useDailyGoal,
} from '../../store/dailyGoal';

const APP_VERSION = '1.0.0';

export default function Settings() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const goalLevel = useDailyGoal((s) => s.level);
  const setGoalLevel = useDailyGoal((s) => s.setLevel);

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)]">
      <PageHeader title="Ajustes" />

      <div className="p-4 space-y-4">
        {/* Meta diaria */}
        <FECard variant="flat">
          <h2 className="text-base font-bold mb-1">Meta diaria</h2>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            ¿Cuántas lecciones quieres completar al día?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DAILY_GOAL_ORDER.map((opt) => {
              const selected = (goalLevel ?? DEFAULT_DAILY_LEVEL) === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setGoalLevel(opt)}
                  aria-pressed={selected}
                  className={cn(
                    'rounded-xl border-2 p-3 text-center transition-colors',
                    selected
                      ? 'border-[var(--color-brand-primary)] bg-[var(--color-brand-info-bg)]'
                      : 'border-[var(--color-neutral-200)]',
                  )}
                >
                  <span className="block text-sm font-bold">{DAILY_GOAL_META[opt].label}</span>
                  <span className="block text-xs text-[var(--color-text-secondary)]">
                    {DAILY_GOAL_META[opt].lessons} · {DAILY_GOAL_XP[opt]} XP
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-[var(--color-text-secondary)]">
            Cada 3 días seguidos con meta cumplida ganas un escudo (máx. 2). Un escudo protege tu
            racha si faltas un día.
          </p>
        </FECard>

        {/* Cuenta */}
        <FECard variant="flat">
          <h2 className="text-base font-bold mb-3">Cuenta</h2>
          <div className="divide-y divide-[var(--color-neutral-200)]">
            <div className="py-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Correo electrónico</p>
              <p className="font-medium text-sm">{user?.email ?? '—'}</p>
            </div>
            <div className="py-3">
              <p className="text-xs text-[var(--color-text-secondary)]">Versión de la app</p>
              <p className="font-medium text-sm">v{APP_VERSION}</p>
            </div>
          </div>
        </FECard>

        <FECard variant="flat">
          <h2 className="text-base font-bold mb-3">Newsletter</h2>
          <Link to="/app/newsletter" className="text-[var(--color-brand-primary)] font-semibold">
            Administrar mi suscripción y correos
          </Link>
        </FECard>

        {/* Datos y privacidad */}
        <FECard variant="flat">
          <h2 className="text-base font-bold mb-3">Datos y privacidad</h2>
          <div className="divide-y divide-[var(--color-neutral-200)]">
            <Link
              to="/terms"
              className="flex items-center justify-between py-3 text-[var(--color-brand-primary)] font-medium text-sm hover:opacity-80 transition-opacity"
            >
              Términos y condiciones
              <ExternalLink className="h-4 w-4 shrink-0" />
            </Link>
            <Link
              to="/privacy"
              className="flex items-center justify-between py-3 text-[var(--color-brand-primary)] font-medium text-sm hover:opacity-80 transition-opacity"
            >
              Política de privacidad
              <ExternalLink className="h-4 w-4 shrink-0" />
            </Link>
          </div>
        </FECard>

        {/* Sesión — solo usuarios logueados (en invitado no aplica cerrar sesión) */}
        {user && (
          <FECard variant="flat">
            <h2 className="text-base font-bold mb-4">Sesión</h2>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </FECard>
        )}
      </div>
    </div>
  );
}
