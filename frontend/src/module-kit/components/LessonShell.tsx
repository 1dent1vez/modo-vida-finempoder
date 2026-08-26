import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FECard from '../../shared/components/FECard';
import FinniMessage from '../../shared/components/FinniMessage';
import { PageHeader } from '../../shared/components/PageHeader';
import { Button } from '../../shared/components/ui/button';
import { cn } from '@/lib/utils';
import { track, EVENTOS } from '@/lib/analytics';
import { localDayKey } from '@/lib/localDate';
import { lessonProgressRepository } from '../../db/lessonProgress.repository';
import { lessonResumeRepository } from '../../db/lessonResume.repository';
import { resolveLessonCompletion, type LessonCompletion } from '../lessonContract';
import { COMPLETION_MESSAGES } from './lessonCompletionMessages';
import { FRASES_SALUDO_DIA, fraseAleatoria } from '../../lib/finniFrases';
import { LockedLessonScreen } from './LockedLessonScreen';
import { useLessons } from '../../store/lessons';
import { useProgress } from '../../store/progress';
import type { ModKey } from '../../store/progress';
import {
  buildModuleProgress,
  getLessonPath,
  getNextLessonId,
  getNextLessonPath,
  getPreviousLessonPath,
  getProgressPercent,
  getRequiredLessonId,
  saveModuleProgressSnapshot,
  toCompletionMap,
  type ModuleFlowConfig,
} from '../moduleFlow';

/** Flag de "saludo del día ya mostrado" (F2-GAMIFICACION, una vez por día local). */
const DAY_GREETING_KEY = 'fe_finni_day_greeting';

const MODULE_COLOR_MAP: Record<string, 'warning' | 'success' | 'info'> = {
  presupuesto: 'warning',
  ahorro: 'success',
  inversion: 'info',
};

const MODULE_BUTTON_CLASS: Record<string, string> = {
  warning: 'bg-[var(--color-brand-warning)] hover:bg-[var(--color-brand-secondary-dark)] text-white',
  success: 'bg-[var(--color-brand-success)] hover:opacity-90 text-white',
  info: '',
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
    if (typeof mq.addListener === 'function') {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }
    return undefined;
  }, []);

  return reduced;
}

export type LessonShellCoreProps = {
  id: string;
  title: string;
  children: ReactNode;
  completeWhen?: boolean;
  score?: number;
  completion?: LessonCompletion;
};

export type LessonShellProps = LessonShellCoreProps & {
  moduleId: ModKey;
  config: ModuleFlowConfig;
};

export function LessonShell({ moduleId, config, ...props }: LessonShellProps) {
  const nav = useNavigate();
  const markLegacyComplete = useLessons((s) => s.complete);
  const hydrateLessons = useLessons((s) => s.hydrateFromCompletionMap);
  const setModuleProgress = useProgress((s) => s.setModuleProgress);
  const recordActivity = useProgress((s) => s.recordActivity);

  const [completed, setCompleted] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [requiredLessonId, setRequiredLessonId] = useState<string | null>(null);
  const [persisting, setPersisting] = useState(false);
  const once = useRef(false);
  const confettiFired = useRef(false);
  // F5-PROMESAS: guard de unmount. persistCompletion es async y puede terminar
  // después de desmontar (p.ej. al navegar antes de que Dexie resuelva); ningún
  // setState debe correr sobre un componente desmontado.
  const mounted = useRef(true);
  const reducedMotion = useReducedMotion();
  const [xp, setXp] = useState(0);
  const [showDayGreeting, setShowDayGreeting] = useState(false);
  const [dayGreeting] = useState(() => fraseAleatoria(FRASES_SALUDO_DIA));

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  // F2-GAMIFICACION: saludo de Finni en la primera lección del día cuando aún
  // no hay actividad hoy (streak.lastActiveISO !== hoy). Una vez por día
  // (flag 'fe_finni_day_greeting' con la fecha local).
  useEffect(() => {
    try {
      const today = localDayKey(new Date());
      if (localStorage.getItem(DAY_GREETING_KEY) === today) return;
      localStorage.setItem(DAY_GREETING_KEY, today);
      const streak = useProgress.getState().streak;
      if (streak.lastActiveISO !== today) setShowDayGreeting(true);
    } catch {
      // localStorage no disponible: sin saludo, sin error.
    }
  }, []);

  const completion = useMemo(
    () => resolveLessonCompletion({
      completeWhen: props.completeWhen,
      score: props.score,
      completion: props.completion,
    }),
    [props.completeWhen, props.score, props.completion]
  );

  const completionMessage = useMemo(
    () =>
      completed
        ? COMPLETION_MESSAGES[Math.floor(Math.random() * COMPLETION_MESSAGES.length)]
        : null,
    [completed]
  );

  const hydrateFromRepository = useCallback(async () => {
    const rows = await lessonProgressRepository.getModuleProgress(moduleId);
    if (!mounted.current) return;
    const completedMap = toCompletionMap(rows);
    const moduleProgress = buildModuleProgress(config, completedMap);
    const requiredId = getRequiredLessonId(config, props.id, completedMap);
    const lessonCompleted = completedMap[props.id] === true;

    hydrateLessons(completedMap);
    setModuleProgress(moduleId, getProgressPercent(config, moduleProgress));
    saveModuleProgressSnapshot(config, moduleProgress);
    setCompleted(lessonCompleted);
    setRequiredLessonId(requiredId);
    setIsLocked(requiredId !== null && !lessonCompleted);
  }, [config, hydrateLessons, moduleId, props.id, setModuleProgress]);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      try {
        await hydrateFromRepository();
        track(EVENTOS.LESSON_STARTED, { moduleId, lessonId: props.id });
      } catch (err) {
        console.error(`[${moduleId}-progress] error hydrating lesson state`, err);
      } finally {
        if (!cancelled) setCheckingAccess(false);
      }
    };
    void init();
    return () => { cancelled = true; };
  }, [hydrateFromRepository, moduleId, props.id]);

  useEffect(() => {
    if (checkingAccess || !completion.ready || completed || isLocked || once.current) return;

    once.current = true;
    setPersisting(true);
    setCompleted(true);

    const persistCompletion = async () => {
      try {
        await lessonProgressRepository.setCompleted(moduleId, props.id);
        await lessonResumeRepository.clear(moduleId, props.id);

        const alreadyLegacy = useLessons
          .getState()
          .lessons.some((l) => l.id === props.id && l.completed);
        if (!alreadyLegacy) {
          markLegacyComplete(props.id, completion.score ?? 100);
        }

        recordActivity(moduleId, 0);
        await hydrateFromRepository();

        // F2-GAMIFICACION: avisa a la celebración global de logros para que el
        // modal espere ~2.5s tras el confetti/XP de esta lección (evento
        // mínimo y documentado en F2_GAMIFICACION.md).
        window.dispatchEvent(
          new CustomEvent('fe:lesson-completed', {
            detail: { moduleId, lessonId: props.id, completedAt: Date.now() },
          })
        );
        track(EVENTOS.LESSON_COMPLETED, { moduleId, lessonId: props.id, xp: completion.score ?? 100 });

        if (import.meta.env.DEV) {
          console.info(`[${moduleId}-progress] lesson completed`, { moduleId, lessonId: props.id });
        }
      } catch (err) {
        console.error(`[${moduleId}-progress] error persisting lesson completion`, err);
        if (mounted.current) {
          setCompleted(false);
          once.current = false;
        }
      } finally {
        if (mounted.current) setPersisting(false);
      }
    };

    void persistCompletion();
  }, [
    checkingAccess,
    completed,
    completion.ready,
    completion.score,
    hydrateFromRepository,
    isLocked,
    markLegacyComplete,
    moduleId,
    props.id,
    recordActivity,
  ]);

  useEffect(() => {
    if (!completed || confettiFired.current) return;
    confettiFired.current = true;
    if (reducedMotion) return;
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
  }, [completed, reducedMotion]);

  useEffect(() => {
    if (!completed) return;
    const target = completion.score ?? 100;
    if (reducedMotion) {
      setXp(target);
      return;
    }

    const duration = 800;
    const start = performance.now();
    let frameId: number | null = null;
    let cancelled = false;

    const schedule = (cb: FrameRequestCallback) => {
      if (typeof window.requestAnimationFrame === 'function') {
        frameId = window.requestAnimationFrame(cb);
      } else {
        frameId = window.setTimeout(() => cb(performance.now()), 16);
      }
    };

    const step = () => {
      if (cancelled) return;
      const t = Math.min(1, (performance.now() - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setXp(Math.round(eased * target));
      if (t < 1) schedule(step);
    };

    schedule(step);
    return () => {
      cancelled = true;
      if (frameId !== null) {
        if (typeof window.cancelAnimationFrame === 'function') {
          window.cancelAnimationFrame(frameId);
        } else {
          window.clearTimeout(frameId);
        }
      }
    };
  }, [completed, completion.score, reducedMotion]);

  const previousPath = useMemo(() => getPreviousLessonPath(config, props.id), [config, props.id]);
  const nextPath = useMemo(() => getNextLessonPath(config, props.id), [config, props.id]);
  const nextLessonId = getNextLessonId(config, props.id);
  const moduleColor = MODULE_COLOR_MAP[moduleId] ?? 'info';
  const nextBtnClass = MODULE_BUTTON_CLASS[moduleColor] ?? '';

  const goNext = () => {
    if (nextPath) { nav(nextPath); return; }
    nav(config.overviewPath);
  };

  const goOverview = () => nav(config.overviewPath);

  if (checkingAccess) {
    return (
      <>
        <PageHeader title={props.title} onBack={goOverview} moduleColor={moduleColor} />
        <div className="p-4 pb-20">
          <FECard variant="flat" className="mt-3">
            <p className="text-sm text-[var(--color-text-secondary)]">Validando acceso y progreso...</p>
          </FECard>
        </div>
      </>
    );
  }

  if (isLocked) {
    return (
      <>
        <PageHeader title={props.title} onBack={goOverview} moduleColor={moduleColor} />
        <div className="p-4 pb-20">
          <LockedLessonScreen
            requiredLessonId={requiredLessonId}
            onGoRequiredLesson={(lessonId) => nav(getLessonPath(config, lessonId))}
            onGoOverview={goOverview}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={props.title} onBack={goOverview} moduleColor={moduleColor} />
      <div className="p-4 pb-20">
        <FECard variant="flat" className="mt-3">
          {showDayGreeting && !completed && (
            <FinniMessage variant="coach" message={dayGreeting} className="mb-4" />
          )}
          {props.children}
        </FECard>

        {completed && (
          <div className="mt-6 animate-[fadeIn_200ms_ease-in]">
            <div className="mb-4 flex items-center justify-center gap-3">
              <span
                data-testid="xp-counter"
                className="rounded-full bg-[var(--color-brand-success)]/10 px-4 py-2 text-lg font-extrabold text-[var(--color-brand-success)]"
              >
                +{xp} XP
              </span>
              {!reducedMotion && (
                <span
                  data-testid="xp-float"
                  className="finni-xp-float text-sm font-bold text-[var(--color-brand-success)]"
                >
                  +{completion.score ?? 100} XP
                </span>
              )}
            </div>
            <FinniMessage
              variant="success"
              title="Lección completada"
              message={completionMessage ?? '¡Lección completada!'}
            />
            <p className="mt-2 text-center text-xs text-[var(--color-text-secondary)]">
              {nextLessonId
                ? `Desbloqueaste ${nextLessonId}. Puedes continuar cuando quieras.`
                : 'Completaste este bloque del módulo.'}
            </p>
            {persisting && (
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Guardando progreso...</p>
            )}
            <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
              {previousPath && (
                <Button variant="outline" className="min-h-11 sm:min-w-36" onClick={() => nav(previousPath)}>
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
              )}
              {nextPath && (
                <Button className={cn('min-h-11 sm:min-w-36', nextBtnClass)} onClick={goNext}>
                  <ArrowRight className="h-4 w-4" />
                  Siguiente
                </Button>
              )}
              <Button variant="outline" className="min-h-11 sm:min-w-40" onClick={goOverview}>
                <Home className="h-4 w-4" />
                Menú del módulo
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
