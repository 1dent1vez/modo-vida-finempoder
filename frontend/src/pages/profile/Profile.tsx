import { Trophy, Flame, Zap, User, LogIn, UserPlus, Crown, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../shared/components/PageHeader';
import { StatCard } from '../../shared/components/StatCard';
import FECard from '../../shared/components/FECard';
import { Button } from '../../shared/components/ui/button';
import { Badge } from '../../shared/components/ui/badge';
import { useAuth } from '../../store/auth';
import { useProgress } from '../../store/progress';
import { useGamification } from '../../hooks/gamification/useGamification';

export default function Profile() {
  const navigate = useNavigate();
  const user = useAuth((s) => s.user);
  const modules = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { data: gamification } = useGamification();

  // Las estadísticas siempre vienen del progreso local (caché), no de la red.
  const presupuestoProgress = modules.presupuesto?.progress ?? 0;
  const ahorroProgress = modules.ahorro?.progress ?? 0;
  const inversionProgress = modules.inversion?.progress ?? 0;
  const totalCompleted = Math.round(
    ((presupuestoProgress + ahorroProgress + inversionProgress) / 100) * 15
  );
  const streakCurrent = streak.current ?? 0;
  const xp = gamification?.xp ?? 0;
  const level = gamification?.level ?? 1;

  if (!user) return <GuestProfile stats={{ totalCompleted, streakCurrent, xp }} onNavigate={navigate} />;

  // Usuario logueado: perfil normal SIN botón de cerrar sesión (decisión de producto Fase 0.5).
  const displayName = user.name ?? 'FinEMPODER';
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)]">
      <PageHeader
        title="Mi perfil"
        rightSlot={
          <button
            onClick={() => navigate('/app/settings')}
            aria-label="Ajustes"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

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
            <InfoRow label="Correo electrónico" value={user.email ?? '—'} />
            <InfoRow label="Nombre" value={user.name ?? '—'} />
          </div>
        </FECard>

        {/* Estadísticas */}
        <div>
          <h2 className="text-base font-bold mb-3">Mis estadísticas</h2>
          <StatRow totalCompleted={totalCompleted} streakCurrent={streakCurrent} xp={xp} />
        </div>
      </div>
    </div>
  );
}

function GuestProfile({
  stats,
  onNavigate,
}: {
  stats: { totalCompleted: number; streakCurrent: number; xp: number };
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)]">
      <PageHeader
        title="Mi perfil"
        rightSlot={
          <button
            onClick={() => onNavigate('/app/settings')}
            aria-label="Ajustes"
            className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[var(--color-neutral-100)] transition-colors"
          >
            <Settings className="h-5 w-5" />
          </button>
        }
      />

      <div className="p-4 space-y-5">
        {/* Avatar genérico tipo Messenger (sin datos de usuario) */}
        <FECard variant="hero" className="text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-20 w-20 rounded-full bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] flex items-center justify-center text-[var(--color-text-secondary)]">
              <User className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold mb-1">Modo invitado</h2>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Tu progreso se guarda en este dispositivo.
              </p>
            </div>
          </div>
        </FECard>

        {/* Acciones de cuenta */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="w-full min-h-11" onClick={() => onNavigate('/auth')}>
            <UserPlus className="h-4 w-4" />
            Registrarse
          </Button>
          <Button variant="outline" className="w-full min-h-11" onClick={() => onNavigate('/login')}>
            <LogIn className="h-4 w-4" />
            Iniciar sesión
          </Button>
        </div>

        {/* Aviso de pérdida de progreso (PWA-aware) */}
        <FECard variant="flat" className="border-[var(--color-status-warning)] bg-[var(--color-status-warning-bg)]">
          <p className="text-sm text-[var(--color-text-primary)]">
            Guarda tu progreso creando una cuenta. De lo contrario, lo perderás si desinstalas la
            aplicación o dejas de usarla.
          </p>
        </FECard>

        {/* CTA premium (placeholder, aún no construido) */}
        <Button
          variant="outline"
          className="w-full min-h-11 border-[var(--color-brand-primary)] text-[var(--color-brand-primary)]"
          onClick={() => onNavigate('/app/upgrade')}
        >
          <Crown className="h-4 w-4" />
          Actualizar a premium
        </Button>

        {/* Estadísticas locales (caché del dispositivo) */}
        <div>
          <h2 className="text-base font-bold mb-3">Tu progreso</h2>
          <StatRow
            totalCompleted={stats.totalCompleted}
            streakCurrent={stats.streakCurrent}
            xp={stats.xp}
          />
        </div>
      </div>
    </div>
  );
}

function StatRow({
  totalCompleted,
  streakCurrent,
  xp,
}: {
  totalCompleted: number;
  streakCurrent: number;
  xp: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard icon={<Trophy />} label="Lecciones" value={totalCompleted} color="primary" size="sm" />
      <StatCard icon={<Flame />} label="Racha" value={`${streakCurrent}d`} color="warning" size="sm" />
      <StatCard icon={<Zap />} label="XP" value={xp} color="info" size="sm" />
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
