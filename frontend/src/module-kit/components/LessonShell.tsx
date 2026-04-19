import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowLeft, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FECard from '../../shared/components/FECard';
import FinniMessage from '../../shared/components/FinniMessage';
import { PageHeader } from '../../shared/components/PageHeader';
import { Button } from '../../shared/components/ui/button';
import { cn } from '@/lib/utils';
import { lessonProgressRepository } from '../../db/lessonProgress.repository';
import { resolveLessonCompletion, type LessonCompletion } from '../lessonContract';
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

  const completion = useMemo(
    () => resolveLessonCompletion({
      completeWhen: props.completeWhen,
      score: props.score,
      completion: props.completion,
    }),
    [props.completeWhen, props.score, props.completion]
  );

  const hydrateFromRepository = useCallback(async () => {
    const rows = await lessonProgressRepository.getModuleProgress(moduleId);
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
      } catch (err) {
        console.error(`[${moduleId}-progress] error hydrating lesson state`, err);
      } finally {
        if (!cancelled) setCheckingAccess(false);
      }
    };
    void init();
    return () => { cancelled = true; };
  }, [hydrateFromRepository, moduleId]);

  useEffect(() => {
    if (checkingAccess || !completion.ready || completed || isLocked || once.current) return;

    once.current = true;
    setPersisting(true);
    setCompleted(true);

    const persistCompletion = async () => {
      try {
        await lessonProgressRepository.setCompleted(moduleId, props.id);

        const alreadyLegacy = useLessons
          .getState()
          .lessons.some((l) => l.id === props.id && l.completed);
        if (!alreadyLegacy) {
          markLegacyComplete(props.id, completion.score ?? 100);
        }

        recordActivity(moduleId, 0);
        await hydrateFromRepository();

        if (import.meta.env.DEV) {
          console.info(`[${moduleId}-progress] lesson completed`, { moduleId, lessonId: props.id });
        }
      } catch (err) {
        console.error(`[${moduleId}-progress] error persisting lesson completion`, err);
        setCompleted(false);
        once.current = false;
      } finally {
        setPersisting(false);
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
          {props.children}
        </FECard>

        {completed && (
          <div className="mt-6 animate-[fadeIn_200ms_ease-in]">
            <FinniMessage
              variant="success"
              title="Lección completada"
              message={
                nextLessonId
                  ? `Desbloqueaste ${nextLessonId}. Puedes continuar cuando quieras.`
                  : 'Completaste este bloque del módulo.'
              }
            />
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
