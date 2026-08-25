import { useEffect, useMemo } from 'react';
import { Check, Coins, PiggyBank, Play, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../store/progress';
import { useAuth } from '../../store/auth';
import { useDailyXp } from '../../hooks/gamification/useDailyXp';
import { DAILY_GOAL_META, resolveDailyXpTarget, useDailyGoal } from '../../store/dailyGoal';
import { localDayKey } from '../../lib/localDate';
import { Button } from '../../shared/components/ui/button';
import { DailyGoalRing } from '../../shared/components/gamification/DailyGoalRing';
import FECard from '../../shared/components/FECard';
import { DailyGoalDialog } from './DailyGoalDialog';
import {
  getLessonPath,
  getProgressPercent,
  loadModuleProgressSnapshot,
  toCompletedMapFromProgress,
  type ModuleFlowConfig,
} from '../../module-kit/moduleFlow';
import { getLessonNodeState } from '../../module-kit/lessonPathState';
import { BUDGET_MODULE_CONFIG } from '../modules/presupuesto/lessonFlow';
import { SAVINGS_MODULE_CONFIG } from '../modules/ahorro/lessonFlow';
import { INVESTMENT_MODULE_CONFIG } from '../modules/inversion/lessonFlow';

type ModuleMeta = {
  config: ModuleFlowConfig;
  title: string;
  icon: React.ReactNode;
};

const MODULES: ModuleMeta[] = [
  {
    config: BUDGET_MODULE_CONFIG,
    title: 'Presupuestación',
    icon: <PiggyBank />,
  },
  {
    config: SAVINGS_MODULE_CONFIG,
    title: 'Ahorro',
    icon: <Coins />,
  },
  {
    config: INVESTMENT_MODULE_CONFIG,
    title: 'Inversión',
    icon: <TrendingUp />,
  },
];

/** Estado por módulo con la MISMA lógica que LessonPath (getLessonNodeState →
 *  getRequiredLessonId + completedMap, única fuente de bloqueo por lección). */
function computeModuleStates() {
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

/** Módulo "en curso": el más avanzado con una lección disponible. */
function computeContinueState() {
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

      <DailyGoalDialog />
    </div>
  );
}
