import { useMemo } from 'react';
import { BookOpen, Flame, Trophy, Lightbulb, Play, PiggyBank, TrendingUp, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProgress } from '../../store/progress';
import { useAuth } from '../../store/auth';
import { useGamification } from '../../hooks/gamification/useGamification';
import FECard from '../../shared/components/FECard';
import { StatCard } from '../../shared/components/StatCard';
import { XPChip } from '../../shared/components/gamification/XPChip';
import { StreakBadge } from '../../shared/components/gamification/StreakBadge';
import { Button } from '../../shared/components/ui/button';
import { Progress } from '../../shared/components/ui/progress';
import {
  getLessonPath,
  getProgressPercent,
  loadModuleProgressSnapshot,
} from '../../module-kit/moduleFlow';
import { BUDGET_MODULE_CONFIG } from '../modules/presupuesto/lessonFlow';
import { SAVINGS_MODULE_CONFIG } from '../modules/ahorro/lessonFlow';
import { INVESTMENT_MODULE_CONFIG } from '../modules/inversion/lessonFlow';

const DAILY_TIPS = [
  'Separa el 10% de tu ingreso antes de gastar. Paga primero a tu yo futuro.',
  'El gasto hormiga suma más de lo que crees: un café diario = $1,500 al mes.',
  'La regla 50-30-20: 50% necesidades, 30% deseos, 20% ahorro e inversión.',
  'Un fondo de emergencia de 3-6 meses de gastos es tu escudo financiero.',
  'Antes de invertir, elimina deudas con tasas mayores al 15% anual.',
  'Anota cada gasto hoy. En una semana verás patrones que no esperabas.',
  'La inflación reduce el poder de tu dinero. Invertirlo lo protege.',
  'Automatiza tu ahorro: transfiérelo el día que cobras, no lo que sobre.',
  'Diversificar es no poner todos los huevos en una canasta.',
  'El interés compuesto es magia: $1,000 al 10% anual = $2,594 en 10 años.',
  'Define tu meta de ahorro con monto y fecha límite. Sin fecha, no es meta.',
  'Revisa tus suscripciones cada mes. Las olvidadas cuestan más de $500/año.',
  'El mejor momento para empezar a invertir fue ayer. El segundo mejor es hoy.',
  'Conoce tu perfil de riesgo antes de elegir instrumento de inversión.',
];

function getDailyTip(): string {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86_400_000);
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
}

type ModuleContinue = {
  path: string;
  lessonTitle: string;
  moduleTitle: string;
  color: 'warning' | 'success' | 'info';
  progress: number;
};

function computeContinueCards(): ModuleContinue[] {
  const modules = [
    { config: BUDGET_MODULE_CONFIG, moduleTitle: 'Presupuestación', color: 'warning' as const },
    { config: SAVINGS_MODULE_CONFIG, moduleTitle: 'Ahorro', color: 'success' as const },
    { config: INVESTMENT_MODULE_CONFIG, moduleTitle: 'Inversión', color: 'info' as const },
  ];
  const results: ModuleContinue[] = [];
  for (const { config, moduleTitle, color } of modules) {
    const snapshot = loadModuleProgressSnapshot(config);
    const progress = getProgressPercent(config, snapshot);
    const next = (config.lessons as ReadonlyArray<{ id: string; title: string; kind: string }>)
      .find((l) => snapshot.lessons[l.id] !== 'completed');
    if (!next) continue;
    results.push({ path: getLessonPath(config, next.id), lessonTitle: next.title, moduleTitle, color, progress });
  }
  return results.sort((a, b) => b.progress - a.progress);
}

function computeTotalCompleted(): number {
  return [BUDGET_MODULE_CONFIG, SAVINGS_MODULE_CONFIG, INVESTMENT_MODULE_CONFIG].reduce((total, config) => {
    const snapshot = loadModuleProgressSnapshot(config);
    return total + Object.values(snapshot.lessons).filter((s) => s === 'completed').length;
  }, 0);
}

const MODULE_BAR: Record<string, string> = {
  warning: 'bg-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info)]',
};
const MODULE_TEXT: Record<string, string> = {
  warning: 'text-[var(--color-brand-warning)]',
  success: 'text-[var(--color-brand-success)]',
  info: 'text-[var(--color-brand-info)]',
};
const MODULE_BG: Record<string, string> = {
  warning: 'bg-[var(--color-brand-warning-bg)] border-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success-bg)] border-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info-bg)] border-[var(--color-brand-info)]',
};
const MODULE_BTN: Record<string, string> = {
  warning: 'bg-[var(--color-brand-warning)] hover:bg-[var(--color-brand-secondary-dark)] text-white',
  success: 'bg-[var(--color-brand-success)] hover:opacity-90 text-white',
  info: '',
};

type ModuleCardProps = {
  title: string;
  subtitle: string;
  progress: number;
  color: 'warning' | 'success' | 'info';
  icon: React.ReactNode;
  onOpen: () => void;
};

function ModuleCard({ title, subtitle, progress, color, icon, onOpen }: ModuleCardProps) {
  return (
    <FECard variant="elevated" clickable onClick={onOpen}>
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5', MODULE_BG[color])}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">{title}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">{subtitle}</p>
        </div>
      </div>
      <Progress value={progress} barClassName={MODULE_BAR[color]} className="mb-2" />
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-text-secondary)]">{progress}% completado</span>
        <Button size="sm" className={cn(MODULE_BTN[color])}>Ir</Button>
      </div>
    </FECard>
  );
}

export default function Home() {
  const nav = useNavigate();
  const mod = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);
  const { user } = useAuth();
  const { data: gamification } = useGamification();

  const continueCards = useMemo(() => computeContinueCards(), []);
  const totalCompleted = useMemo(() => computeTotalCompleted(), []);
  const primaryContinue = continueCards[0] ?? null;

  const displayName = user?.name
    ? user.name.split(' ')[0]
    : user?.email?.split('@')[0] ?? 'Estudiante';

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="min-h-screen pb-24 bg-[var(--color-bg-app)] px-4 pt-5">

      {/* Greeting Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xl font-bold text-white">
            {displayName[0]?.toUpperCase() ?? 'U'}
          </div>
          <div>
            <h1 className="text-lg font-extrabold">Hola, {displayName}</h1>
            <p className="text-xs capitalize text-[var(--color-text-secondary)]">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gamification && <XPChip xp={gamification.xp} />}
          <StreakBadge streak={streak.current} />
        </div>
      </div>

      {/* ContinueCard */}
      {primaryContinue && (
        <FECard variant="hero" className={cn('mb-6 border-2', MODULE_BG[primaryContinue.color])}>
          <p className={cn('text-xs font-bold uppercase tracking-wide mb-1', MODULE_TEXT[primaryContinue.color])}>
            {primaryContinue.moduleTitle} · {primaryContinue.progress}% completado
          </p>
          <h2 className="font-bold mb-4 truncate">{primaryContinue.lessonTitle}</h2>
          <Button className={cn('w-full min-h-11', MODULE_BTN[primaryContinue.color])} onClick={() => nav(primaryContinue.path)}>
            <Play className="h-4 w-4" />
            Ir ahora
          </Button>
        </FECard>
      )}

      {/* Tus módulos */}
      <h2 className="text-base font-bold mb-3">Tus módulos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <ModuleCard title="Presupuestación" subtitle="Organiza ingresos y gastos" progress={mod.presupuesto?.progress ?? 0} color="warning" icon={<PiggyBank />} onOpen={() => nav('/app/presupuesto')} />
        <ModuleCard title="Ahorro" subtitle="Crea hábitos de ahorro" progress={mod.ahorro?.progress ?? 0} color="success" icon={<School />} onOpen={() => nav('/app/ahorro')} />
        <ModuleCard title="Inversión" subtitle="Haz crecer tu dinero" progress={mod.inversion?.progress ?? 0} color="info" icon={<TrendingUp />} onOpen={() => nav('/app/inversion')} />
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <StatCard icon={<BookOpen />} label="Lecciones" value={totalCompleted} color="primary" size="sm" />
        <StatCard icon={<Flame />} label="Racha" value={`${streak.current}d`} color="warning" size="sm" />
        <StatCard icon={<Trophy />} label="XP" value={gamification?.xp ?? 0} color="success" size="sm" />
      </div>

      {/* Daily Tip */}
      <FECard variant="flat">
        <div className="flex gap-3 items-start">
          <Lightbulb className="h-5 w-5 shrink-0 mt-0.5 text-[var(--color-brand-warning)]" />
          <div>
            <p className="text-sm font-bold mb-1">Tip del día</p>
            <p className="text-sm text-[var(--color-text-secondary)]">{getDailyTip()}</p>
          </div>
        </div>
      </FECard>
    </div>
  );
}
