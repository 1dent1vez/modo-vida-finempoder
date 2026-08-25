import { Fragment, useEffect, useMemo } from 'react';
import {
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  Flame,
  Lightbulb,
  Lock,
  PiggyBank,
  Play,
  Star,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProgress } from '../../store/progress';
import { useAuth } from '../../store/auth';
import { useGamification } from '../../hooks/gamification/useGamification';
import { useDailyXp } from '../../hooks/gamification/useDailyXp';
import { useWeekStats } from '../../hooks/gamification/useWeekStats';
import FECard from '../../shared/components/FECard';
import { XPChip } from '../../shared/components/gamification/XPChip';
import { StreakBadge } from '../../shared/components/gamification/StreakBadge';
import { DailyGoalRing } from '../../shared/components/gamification/DailyGoalRing';
import { ShieldBadge } from '../../shared/components/gamification/ShieldBadge';
import FinniMessage from '../../shared/components/FinniMessage';
import { DAILY_GOAL_META, resolveDailyXpTarget, useDailyGoal } from '../../store/dailyGoal';
import { localDayKey } from '../../lib/localDate';
import { Button } from '../../shared/components/ui/button';
import { Progress } from '../../shared/components/ui/progress';
import { DailyGoalDialog } from './DailyGoalDialog';
import { getDailyTip } from './dailyTips';
import {
  getLessonPath,
  getProgressPercent,
  loadModuleProgressSnapshot,
  toCompletedMapFromProgress,
  type ModuleFlowConfig,
  type ModuleLesson,
} from '../../module-kit/moduleFlow';
import { getLessonNodeState } from '../../module-kit/lessonPathState';
import { BUDGET_MODULE_CONFIG } from '../modules/presupuesto/lessonFlow';
import { SAVINGS_MODULE_CONFIG } from '../modules/ahorro/lessonFlow';
import { INVESTMENT_MODULE_CONFIG } from '../modules/inversion/lessonFlow';

type ModuleColor = 'warning' | 'success' | 'info';

const MODULE_BAR: Record<ModuleColor, string> = {
  warning: 'bg-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info)]',
};

const MODULE_BG: Record<ModuleColor, string> = {
  warning: 'bg-[var(--color-brand-warning-bg)] text-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info-bg)] text-[var(--color-brand-info)]',
};

type ModuleMeta = {
  config: ModuleFlowConfig;
  title: string;
  color: ModuleColor;
  icon: React.ReactNode;
};

const MODULES: ModuleMeta[] = [
  { config: BUDGET_MODULE_CONFIG, title: 'Presupuestación', color: 'warning', icon: <Wallet /> },
  { config: SAVINGS_MODULE_CONFIG, title: 'Ahorro', color: 'success', icon: <PiggyBank /> },
  { config: INVESTMENT_MODULE_CONFIG, title: 'Inversión', color: 'info', icon: <TrendingUp /> },
];

type ModuleState = {
  meta: ModuleMeta;
  completedMap: Record<string, boolean>;
  progress: number;
  nextLessonId: string | null;
};

/** Estado por módulo con la MISMA lógica que LessonPath (getLessonNodeState →
 *  getRequiredLessonId + completedMap). El candado entre módulos usa la última
 *  lección del módulo anterior (secuencia Presupuestación → Ahorro → Inversión). */
function computeModuleStates(): ModuleState[] {
  return MODULES.map((meta) => {
    const snapshot = loadModuleProgressSnapshot(meta.config);
    const completedMap = toCompletedMapFromProgress(snapshot);
    const nextLessonId =
      meta.config.lessons.find(
        (lesson) => getLessonNodeState(meta.config, lesson.id, completedMap) === 'current'
      )?.id ?? null;
    return {
      meta,
      completedMap,
      progress: getProgressPercent(meta.config, snapshot),
      nextLessonId,
    };
  });
}

type ModuleCardData = ModuleMeta & {
  order: number;
  progress: number;
  locked: boolean;
};

function computeModuleCards(): ModuleCardData[] {
  const states = computeModuleStates();
  return states.map((state, index) => {
    const prev = states[index - 1];
    const prevLastId = prev
      ? prev.meta.config.lessons[prev.meta.config.lessons.length - 1]?.id
      : null;
    const locked = index > 0 && (prevLastId === null || prev.completedMap[prevLastId] !== true);
    return {
      ...state.meta,
      order: index + 1,
      progress: state.progress,
      locked,
    };
  });
}

type ContinueInfo = {
  config: ModuleFlowConfig;
  moduleTitle: string;
  color: ModuleColor;
  lesson: ModuleLesson;
  progress: number;
};

/** Módulo "en curso": el más avanzado con una lección disponible (igual criterio
 *  que la Ola 2). null solo cuando los 3 módulos están completos. */
function computeContinueInfo(): ContinueInfo | null {
  const candidate = computeModuleStates()
    .filter((state) => state.nextLessonId !== null)
    .sort((a, b) => b.progress - a.progress)[0];
  if (!candidate?.nextLessonId) return null;
  const lesson = candidate.meta.config.lessons.find((l) => l.id === candidate.nextLessonId);
  if (!lesson) return null;
  return {
    config: candidate.meta.config,
    moduleTitle: candidate.meta.title,
    color: candidate.meta.color,
    lesson,
    progress: candidate.progress,
  };
}

function CoinChartIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={cn('h-24 w-24 shrink-0', className)} aria-hidden="true" fill="none">
      <circle cx="48" cy="48" r="40" fill="var(--color-brand-secondary-light)" opacity="0.35" />
      <path
        d="M26 62 40 46l12 8 18-24"
        stroke="var(--color-brand-secondary)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="26" cy="62" r="7" fill="var(--color-brand-warning)" stroke="var(--color-brand-secondary-light)" strokeWidth="2" />
    </svg>
  );
}

function CoinStackIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" className={cn('h-20 w-20 shrink-0', className)} aria-hidden="true" fill="none">
      <ellipse cx="48" cy="34" rx="20" ry="9" fill="var(--color-brand-warning)" />
      <path d="M28 34v22c0 5 9 9 20 9s20-4 20-9V34" fill="var(--color-brand-secondary-light)" opacity="0.55" />
      <ellipse cx="48" cy="56" rx="20" ry="9" fill="var(--color-brand-secondary-light)" />
      <path d="M28 56v16c0 5 9 9 20 9s20-4 20-9V56" fill="var(--color-brand-warning)" opacity="0.7" />
    </svg>
  );
}

function WeekStat({
  icon,
  label,
  value,
  circleClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  circleClass: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-full [&_svg]:h-5 [&_svg]:w-5',
          circleClass
        )}
      >
        {icon}
      </div>
      <p className="text-lg font-extrabold">{value}</p>
      <p className="text-[11px] font-semibold leading-tight text-[var(--color-text-secondary)]">
        {label}
      </p>
    </div>
  );
}

export default function Home() {
  const nav = useNavigate();
  const streak = useProgress((s) => s.streak);
  const { user } = useAuth();
  const { data: gamification } = useGamification();
  const { xpToday, loaded } = useDailyXp();
  const { stats: week } = useWeekStats();
  const goalLevel = useDailyGoal((s) => s.level);
  const celebratedDay = useDailyGoal((s) => s.celebratedDay);
  const markCelebrated = useDailyGoal((s) => s.markCelebrated);
  const xpTarget = resolveDailyXpTarget(goalLevel);
  const goalReached = loaded && xpTarget > 0 && xpToday >= xpTarget;

  useEffect(() => {
    if (!goalReached) return;
    useProgress.getState().markDailyGoalReached();
    const today = localDayKey(new Date());
    if (celebratedDay !== today) markCelebrated(today);
  }, [celebratedDay, goalReached, markCelebrated]);

  const continueInfo = useMemo(() => computeContinueInfo(), []);
  const moduleCards = useMemo(() => computeModuleCards(), []);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';
  const avatarInitial = firstName ? firstName[0].toUpperCase() : 'F';

  const today = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const tip = getDailyTip();

  const goalLabel = goalLevel ? DAILY_GOAL_META[goalLevel].label : DAILY_GOAL_META.regular.label;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] px-4 pt-5 pb-24">
      {/* ── Header: avatar + saludo + fecha + campana ───────────────────── */}
      <header className="mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xl font-bold text-white">
            {avatarInitial}
          </div>
          <div>
            <h1 className="text-lg font-extrabold">{greeting}</h1>
            <p className="text-xs capitalize text-[var(--color-text-secondary)]">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gamification && <XPChip xp={gamification.xp} />}
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-bg-surface)] shadow-[var(--shadow-sm)]"
          >
            <Bell className="h-5 w-5 text-[var(--color-text-secondary)]" />
            <span
              aria-hidden="true"
              className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--color-brand-error)]"
            />
          </button>
        </div>
      </header>

      {/* ── Hero 60/40: Continúa aprendiendo + Meta de hoy ──────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-5">
        <FECard
          variant="hero"
          className="bg-[var(--color-brand-cream)] shadow-[var(--shadow-soft)] sm:col-span-3"
        >
          <h2 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Continúa aprendiendo
          </h2>
          {continueInfo ? (
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold',
                    MODULE_BG[continueInfo.color]
                  )}
                >
                  {continueInfo.moduleTitle}
                </span>
                <h3 className="mt-3 text-lg font-extrabold leading-snug">
                  {continueInfo.lesson.title}
                </h3>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                  Sigue con tu progreso
                </p>
                <div className="mt-4">
                  <Progress
                    value={continueInfo.progress}
                    barClassName={MODULE_BAR[continueInfo.color]}
                  />
                  <p className="mt-1 text-xs font-semibold text-[var(--color-text-secondary)]">
                    {continueInfo.progress}% del módulo
                  </p>
                </div>
                <Button
                  className="mt-4 min-h-11 w-full rounded-xl bg-[var(--color-brand-warning)] text-white hover:bg-[var(--color-brand-secondary-dark)]"
                  onClick={() => nav(getLessonPath(continueInfo.config, continueInfo.lesson.id))}
                >
                  <Play className="h-4 w-4" />
                  Continuar
                </Button>
              </div>
              <CoinChartIllustration className="hidden sm:block" />
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <p className="font-extrabold">¡Completaste los 3 módulos!</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  Revisa tus logros y sigue construyendo tu hábito.
                </p>
              </div>
            </div>
          )}
        </FECard>

        <FECard variant="hero" className="shadow-[var(--shadow-soft)] sm:col-span-2">
          <h2 className="text-sm font-bold">Meta de hoy</h2>
          <div className="mt-3 flex items-center gap-4">
            <DailyGoalRing xpToday={xpToday} xpTarget={xpTarget} />
            <div className="min-w-0 flex-1">
              <p className="text-base font-extrabold">
                {xpToday}/{xpTarget} XP
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Meta {goalLabel.toLowerCase()} · hoy
              </p>
              {goalReached && (
                <FinniMessage
                  variant="success"
                  title="¡Bien hecho!"
                  message="¡Meta del día cumplida!"
                  className="mt-2"
                />
              )}
            </div>
          </div>
          <div className="my-3 h-px bg-[var(--color-neutral-200)]" aria-hidden="true" />
          <div className="flex items-center gap-2">
            {streak.current >= 2 ? (
              <StreakBadge streak={streak.current} />
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-status-warningBg)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-brand-warning)]">
                <Flame className="h-3 w-3" />
                {streak.current} {streak.current === 1 ? 'día' : 'días'}
              </span>
            )}
            <ShieldBadge shields={streak.shields} />
            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
              Racha
            </span>
          </div>
        </FECard>
      </div>

      {/* ── Tu camino: 3 módulos en secuencia con conector punteado ──────── */}
      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Tu camino</h2>
          <button
            type="button"
            onClick={() => nav('/app/presupuesto')}
            className="flex min-h-11 items-center gap-0.5 text-sm font-bold text-[var(--color-brand-primary)]"
          >
            Ver todo
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col">
          {moduleCards.map((card, index) => (
            <Fragment key={card.config.moduleId}>
              {index > 0 && (
                <div
                  aria-hidden="true"
                  className="mx-auto h-5 w-0 border-l-2 border-dashed border-[var(--color-neutral-300)]"
                />
              )}
              <FECard
                variant="flat"
                clickable
                onClick={() => nav(card.config.overviewPath)}
                className={cn(
                  'rounded-2xl shadow-[var(--shadow-soft)] transition-colors',
                  card.locked
                    ? 'border-[var(--color-neutral-200)]'
                    : 'border-[var(--color-brand-primary)]'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold',
                      card.locked
                        ? 'bg-[var(--color-neutral-100)] text-[var(--color-text-muted)]'
                        : 'bg-[var(--color-brand-primary)] text-white'
                    )}
                  >
                    {card.order}
                  </div>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&_svg]:h-5 [&_svg]:w-5',
                      MODULE_BG[card.color]
                    )}
                  >
                    {card.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{card.title}</p>
                    {card.locked ? (
                      <p className="flex items-center gap-1 text-xs font-semibold text-[var(--color-text-muted)]">
                        <Lock className="h-3 w-3" />
                        Próximo
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-[var(--color-brand-primary)]">
                        {card.progress}% avanzado
                      </p>
                    )}
                  </div>
                </div>
              </FECard>
            </Fragment>
          ))}
        </div>
      </section>

      {/* ── Esta semana: stats reales (ventana 7 días desde lessonProgress) ─ */}
      <FECard variant="flat" className="mt-6 rounded-2xl shadow-[var(--shadow-soft)]">
        <h2 className="mb-4 text-base font-bold">Esta semana</h2>
        <div className="grid grid-cols-3 gap-2">
          <WeekStat
            icon={<BookOpen />}
            label="Lecciones completadas"
            value={week.completed}
            circleClass="bg-[var(--color-brand-info-bg)] text-[var(--color-brand-info)]"
          />
          <WeekStat
            icon={<Flame />}
            label="Racha"
            value={streak.current}
            circleClass="bg-[var(--color-brand-warning-bg)] text-[var(--color-brand-warning)]"
          />
          <WeekStat
            icon={<Star />}
            label="XP ganados"
            value={week.xp}
            circleClass="bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]"
          />
        </div>
      </FECard>

      {/* ── Tip del día ─────────────────────────────────────────────────── */}
      <FECard variant="hero" className="mt-6 bg-[var(--color-brand-cream)] shadow-[var(--shadow-soft)]">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-warning-bg)] text-[var(--color-brand-warning)]">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold">Tip del día</h2>
            <p className="mt-1 text-sm leading-relaxed">{tip}</p>
            <p className="mt-2 text-xs font-semibold text-[var(--color-text-secondary)]">
              Un micro-hábito hoy construye tu futuro financiero.
            </p>
          </div>
          <CoinStackIllustration className="hidden sm:block" />
        </div>
      </FECard>

      <DailyGoalDialog />
    </div>
  );
}
