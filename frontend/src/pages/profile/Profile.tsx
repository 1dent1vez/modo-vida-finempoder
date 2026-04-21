import { Trophy, Flame, Zap, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import FECard from '../../shared/components/FECard';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { useAuth } from '../../store/auth';
import { useProgress } from '../../store/progress';
import { useGamification } from '../../hooks/gamification/useGamification';
import { supabase } from '../../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const modules = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { data: gamification } = useGamification();

  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;
  const streakCurrent = streak.current ?? 0;

  const displayName = user?.name ?? 'Estudiante FinEmpoder';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const presupuestoProgress = modules.presupuesto?.progress ?? 0;
  const ahorroProgress = modules.ahorro?.progress ?? 0;
  const inversionProgress = modules.inversion?.progress ?? 0;
  const totalCompleted = Math.round(
    ((presupuestoProgress + ahorroProgress + inversionProgress) / 100) * 15
  );

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)]">
      <PageHeader title="Mi perfil" />

      <div className="p-4 space-y-4">
        {/* Hero: Avatar + nombre + nivel */}
        <FECard variant="hero" className="text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-[var(--color-brand-secondary)] flex items-center justify-center text-white text-3xl font-extrabold">
              {initials || '?'}
            </div>
            <div>
              <h2 className="text-lg font-extrabold mb-1">{displayName}</h2>
              <Badge variant="warning" className="gap-1">
                <Trophy className="h-3 w-3" />
                Nivel {level}
              </Badge>
            </div>
          </div>
        </FECard>

        {/* Información */}
        <FECard variant="flat">
          <h2 className="text-base font-bold mb-3">Información</h2>
          <div className="space-y-3">
            <InfoRow label="Correo electrónico" value={user?.email ?? '—'} />
            <InfoRow label="Nombre" value={user?.name ?? '—'} />
          </div>
        </FECard>

        {/* Estadísticas */}
        <div>
          <h2 className="text-base font-bold mb-3">Mis estadísticas</h2>
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={<Trophy />} label="Lecciones" value={totalCompleted} color="primary" size="sm" />
            <StatCard icon={<Flame />} label="Racha" value={`${streakCurrent}d`} color="warning" size="sm" />
            <StatCard icon={<Zap />} label="XP" value={xp} color="info" size="sm" />
          </div>
        </div>

        {/* Cerrar sesión */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[var(--color-text-secondary)]">{label}</p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}
