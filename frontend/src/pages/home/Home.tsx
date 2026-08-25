import { Fragment, useEffect, useMemo } from 'react';
import { Check, Coins, Lock, PiggyBank, Play, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useProgress } from '../../store/progress';
import { useAuth } from '../../store/auth';
import { useDailyXp } from '../../hooks/gamification/useDailyXp';
import { DAILY_GOAL_META, resolveDailyXpTarget, useDailyGoal } from '../../store/dailyGoal';
import { localDayKey } from '../../lib/localDate';
import { isAdminMode } from '../../lib/adminMode';
import { Button } from '../../shared/components/ui/button';
import { Progress } from '../../shared/components/ui/progress';
import { DailyGoalRing } from '../../shared/components/gamification/DailyGoalRing';
import FECard from '../../shared/components/FECard';
import { DailyGoalDialog } from './DailyGoalDialog';
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

type ModuleAccent = 'warning' | 'success' | 'info';

type ModuleMeta = {
  config: ModuleFlowConfig;
  title: string;
  subtitle: string;
  accent: ModuleAccent;
  icon: React.ReactNode;
};

/** Rutas de overview por módulo (spec F1: /app/presupuesto, /app/ahorro,
 *  /app/inversion — esta última redirige al overview real de inversión). */
const MODULE_OVERVIEW: Record<string, string> = {
  presupuesto: '/app/presupuesto',
  ahorro: '/app/ahorro',
  inversion: '/app/inversion',
};

const MODULES: ModuleMeta[] = [
  {
    config: BUDGET_MODULE_CONFIG,
    title: 'Presupuestación',
    subtitle: 'Organiza ingresos y gastos',
    accent: 'warning',
    icon: <PiggyBank />,
  },
  {
    config: SAVINGS_MODULE_CONFIG,
    title: 'Ahorro',
    subtitle: 'Crea hábitos de ahorro',
    accent: 'success',
    icon: <Coins />,
  },
  {
    config: INVESTMENT_MODULE_CONFIG,
    title: 'Inversión',
    subtitle: 'Haz crecer tu dinero',
    accent: 'info',
    icon: <TrendingUp />,
  },
];

const ACCENT_TEXT: Record<ModuleAccent, string> = {
  warning: 'text-[var(--color-brand-warning)]',
  success: 'text-[var(--color-brand-success)]',
  info: 'text-[var(--color-brand-info)]',
};

const ACCENT_PILL: Record<ModuleAccent, string> = {
  warning: 'bg-[var(--color-brand-warning-bg)] text-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info-bg)] text-[var(--color-brand-info)]',
};

const ACCENT_BAR: Record<ModuleAccent, string> = {
  warning: 'bg-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info)]',
};

const ACCENT_BUTTON: Record<ModuleAccent, string> = {
  warning: 'bg-[var(--color-brand-warning)] hover:bg-[var(--color-brand-secondary-dark)]',
  success: 'bg-[var(--color-brand-success)] hover:opacity-90',
  info: 'bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary-dark)]',
};

type ModuleState = {
  meta: ModuleMeta;
  completedMap: Record<string, boolean>;
  progress: number;
  currentLesson: ModuleLesson | null;
};

/** Estado por módulo con la MISMA lógica que LessonPath (getLessonNodeState →
 *  getRequiredLessonId + completedMap, única fuente de bloqueo por lección). */
function computeModuleStates(): ModuleState[] {
  return MODULES.map((meta) => {
    const snapshot = loadModuleProgressSnapshot(meta.config);
    const completedMap = toCompletedMapFromProgress(snapshot);
    const currentId = meta.config.lessons.find(
      (lesson) => getLessonNodeState(meta.config, lesson.id, completedMap) === 'current'
    )?.id;
    const currentLesson = currentId
      ? (meta.config.lessons.find((lesson) => lesson.id === currentId) ?? null)
      : null;
    return {
      meta,
      completedMap,
      progress: getProgressPercent(meta.config, snapshot),
      currentLesson,
    };
  });
}

/** Candado ENTRE módulos (secuencia Presupuestación → Ahorro → Inversión):
 *  el módulo queda bloqueado hasta completar la última lección del anterior.
 *  En modo admin nunca hay candados. */
function isModuleLocked(states: ModuleState[], index: number): boolean {
  if (isAdminMode() || index === 0) return false;
  const prev = states[index - 1];
  const prevLastId = prev?.meta.config.lessons[prev.meta.config.lessons.length - 1]?.id;
  return !prevLastId || prev.completedMap[prevLastId] !== true;
}

/** Módulo "en curso": el más avanzado con una lección disponible. */
function computeContinueState(): ModuleState | null {
  return (
    computeModuleStates()
      .filter((state) => state.currentLesson !== null)
      .sort((a, b) => b.progress - a.progress)[0] ?? null
  );
}

function capitalizeWords(value: string): string {
  return value
    .split(' ')
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

export default function Home() {
  const nav = useNavigate();
  const { user } = useAuth();
  const { xpToday, loaded } = useDailyXp();
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

  const moduleStates = useMemo(() => computeModuleStates(), []);
  const continueState = useMemo(() => computeContinueState(), []);

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const greeting = firstName ? `Hola, ${firstName}` : 'Hola';
  const avatarInitial = firstName ? firstName[0].toUpperCase() : 'F';

  const rawDate = new Date().toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const todayLabel = capitalizeWords(rawDate);

  const goalLabel = goalLevel ? DAILY_GOAL_META[goalLevel].label : DAILY_GOAL_META.regular.label;

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)] px-4 pb-24 pt-5">
      {/* ── Header: avatar + saludo + fecha (sin campana en el mockup) ──── */}
      <header data-testid="home-header" className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xl font-bold text-white">
          {avatarInitial}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-extrabold">{greeting}</h1>
          <p className="text-xs font-medium text-[var(--color-text-secondary)]">{todayLabel}</p>
        </div>
      </header>

      {/* ── Meta diaria ─────────────────────────────────────────────────── */}
      <section data-testid="section-meta" aria-label="Meta diaria">
        <FECard variant="hero" className="shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-4">
            <DailyGoalRing xpToday={xpToday} xpTarget={xpTarget} />
            <div className="min-w-0 flex-1">
              <p className="text-base font-extrabold">
                Meta {goalLabel} · {xpTarget} XP
              </p>
              <p className="mt-1 text-sm font-medium text-[var(--color-text-secondary)]">
                {xpToday}/{xpTarget} XP hoy
              </p>
            </div>
          </div>
        </FECard>
      </section>

      {/* ── Continúa aprendiendo ────────────────────────────────────────── */}
      <section data-testid="section-continue" aria-label="Continúa aprendiendo" className="mt-6">
        <FECard variant="hero" className="bg-[var(--color-brand-cream)] shadow-[var(--shadow-soft)]">
          {continueState?.currentLesson ? (
            <>
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-[var(--color-brand-secondary-dark)]">
                {continueState.meta.title} · {continueState.progress}% completado
              </p>
              <h3 className="mt-3 truncate text-lg font-extrabold">
                {continueState.currentLesson.title}
              </h3>
              <Button
                variant="default"
                onClick={() =>
                  nav(getLessonPath(continueState.meta.config, continueState.currentLesson!.id))
                }
                className="mt-4 min-h-11 rounded-full bg-[var(--color-brand-warning)] px-6 text-white hover:bg-[var(--color-brand-secondary-dark)]"
              >
                <Play className="h-4 w-4 fill-current" />
                Ir ahora
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-extrabold">Completaste los 3 módulos</p>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                  Revisa tus logros y sigue construyendo tu hábito.
                </p>
              </div>
            </div>
          )}
        </FECard>
      </section>

      {/* ── Tu camino ───────────────────────────────────────────────────── */}
      <section data-testid="section-path" aria-label="Tu camino" className="mt-6">
        <h2 className="text-base font-bold">Tu camino</h2>
        <div className="mt-3 flex flex-col">
          {moduleStates.map((state, index) => {
            const locked = isModuleLocked(moduleStates, index);
            const completed = !locked && state.currentLesson === null;
            const currentNodeNumber = state.currentLesson
              ? state.meta.config.lessons.findIndex((l) => l.id === state.currentLesson!.id) + 1
              : null;
            return (
              <Fragment key={state.meta.config.moduleId}>
                {index > 0 && (
                  <div
                    aria-hidden="true"
                    className="mx-auto h-5 w-0 border-l-2 border-dashed border-[var(--color-neutral-300)]"
                  />
                )}
                <button
                  type="button"
                  onClick={() => nav(MODULE_OVERVIEW[state.meta.config.moduleId])}
                  className="flex w-full items-center gap-3 rounded-2xl border border-[var(--color-neutral-200)] bg-white p-4 text-left shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--color-brand-primary)]"
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-extrabold',
                      locked &&
                        'bg-[var(--color-neutral-100)] text-[var(--color-text-muted)]',
                      completed &&
                        'bg-[var(--color-brand-success-bg)] text-[var(--color-brand-success)]',
                      !locked && !completed && 'bg-[var(--color-brand-primary)] text-white'
                    )}
                  >
                    {locked ? (
                      <Lock className="h-4 w-4" />
                    ) : completed ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      currentNodeNumber
                    )}
                  </div>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&_svg]:h-5 [&_svg]:w-5',
                      ACCENT_PILL[state.meta.accent]
                    )}
                  >
                    {state.meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{state.meta.title}</p>
                    <p
                      className={cn(
                        'text-xs font-bold',
                        locked
                          ? 'text-[var(--color-text-muted)]'
                          : ACCENT_TEXT[state.meta.accent]
                      )}
                    >
                      {state.progress}%
                    </p>
                  </div>
                </button>
              </Fragment>
            );
          })}
        </div>
      </section>

      {/* ── Tus módulos ─────────────────────────────────────────────────── */}
      <section data-testid="section-modules" aria-label="Tus módulos" className="mt-6">
        <h2 className="text-base font-bold">Tus módulos</h2>
        <div className="mt-3 space-y-3">
          {moduleStates.map((state) => (
            <div
              key={state.meta.config.moduleId}
              onClick={() => nav(MODULE_OVERVIEW[state.meta.config.moduleId])}
              className="cursor-pointer rounded-2xl border border-[var(--color-neutral-200)] bg-white p-4 shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--color-brand-primary)]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full [&_svg]:h-5 [&_svg]:w-5',
                    ACCENT_PILL[state.meta.accent]
                  )}
                >
                  {state.meta.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{state.meta.title}</p>
                  <p className="truncate text-xs text-[var(--color-text-secondary)]">
                    {state.meta.subtitle}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => nav(MODULE_OVERVIEW[state.meta.config.moduleId])}
                  className={cn(
                    'min-h-9 shrink-0 rounded-full px-4 text-sm font-bold text-white',
                    ACCENT_BUTTON[state.meta.accent]
                  )}
                >
                  Ir
                </button>
              </div>
              <div className="mt-3">
                <Progress
                  value={state.progress}
                  barClassName={ACCENT_BAR[state.meta.accent]}
                />
                <p className="mt-1 text-xs font-medium text-[var(--color-text-secondary)]">
                  {state.progress}% completado
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DailyGoalDialog />
    </div>
  );
}
