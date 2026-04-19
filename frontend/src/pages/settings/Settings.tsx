import { LogOut, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import FECard from '../../shared/components/FECard';
import { Button } from '../../shared/components/ui/button';
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
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)]">
      <PageHeader title="Ajustes" />

      <div className="p-4 space-y-4">
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

        {/* Sesión */}
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
      </div>
    </div>
  );
}
