import { useCallback, useEffect, useMemo, useState } from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import FECard from '../../shared/components/FECard';
import { PageHeader } from '../../shared/components/PageHeader';
import { XPChip } from '../../shared/components/gamification/XPChip';
import { StreakBadge } from '../../shared/components/gamification/StreakBadge';
import { Button } from '../../shared/components/ui/button';
import { Progress } from '../../shared/components/ui/progress';
import { lessonProgressRepository } from '../../db/lessonProgress.repository';
import { useGamification } from '../../hooks/gamification/useGamification';
import { useLessons } from '../../store/lessons';
import { useProgress, type ModKey } from '../../store/progress';
import {
  buildModuleProgress,
  getLessonPath,
  getProgressPercent,
  getRequiredLessonId,
  loadModuleProgressSnapshot,
  saveModuleProgressSnapshot,
  toCompletionMap,
  type LessonStatus,
  type ModuleFlowConfig,
  type ModuleProgress,
} from '../moduleFlow';
import { ModuleLessonList } from './ModuleLessonList';

const MODULE_COLOR_MAP: Record<string, 'warning' | 'success' | 'info'> = {
  presupuesto: 'warning',
  ahorro: 'success',
  inversion: 'info',
};

const MODULE_BAR_CLASS: Record<string, string> = {
  warning: 'bg-[var(--color-brand-warning)]',
  success: 'bg-[var(--color-brand-success)]',
  info: 'bg-[var(--color-brand-info)]',
};

const MODULE_TEXT_CLASS: Record<string, string> = {
  warning: 'text-[var(--color-brand-warning)]',
  success: 'text-[var(--color-brand-success)]',
  info: 'text-[var(--color-brand-info)]',
};

const MODULE_BUTTON_CLASS: Record<string, string> = {
  warning: 'bg-[var(--color-brand-warning)] hover:bg-[var(--color-brand-secondary-dark)] text-white',
  success: 'bg-[var(--color-brand-success)] hover:opacity-90 text-white',
  info: '',
};

export interface ModuleOverviewProps {
  config: ModuleFlowConfig;
  moduleColor: 'warning' | 'success' | 'info';
  moduleTitle: string;
  moduleIcon?: ReactNode;
}

export function ModuleOverview({ config, moduleTitle }: ModuleOverviewProps) {
  const nav = useNavigate();
  const moduleId = config.moduleId as ModKey;
  const moduleColor = MODULE_COLOR_MAP[moduleId] ?? 'info';

  const { data: gamification } = useGamification();
  const setModuleProgress = useProgress((s) => s.setModuleProgress);
  const hydrateLessons = useLessons((s) => s.hydrateFromCompletionMap);
  const streak = useProgress((s) => s.streak.current);

  const [moduleState, setModuleState] = useState<ModuleProgress>(() =>
    loadModuleProgressSnapshot(config)
  );
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshProgress = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await lessonProgressRepository.getModuleProgress(moduleId);
      const completedMap = toCompletionMap(rows);
      const nextState = buildModuleProgress(config, completedMap);

      setModuleState(nextState);
      saveModuleProgressSnapshot(config, nextState);
      hydrateLessons(completedMap);
      setModuleProgress(moduleId, getProgressPercent(config, nextState));
      setLoadError(null);
    } catch (err) {
      console.error(`[${moduleId}-overview] error loading progress`, err);
      setLoadError('No se pudo cargar tu progreso local. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [config, hydrateLessons, moduleId, setModuleProgress]);

  useEffect(() => {
    void refreshProgress();
    const onFocus = () => { void refreshProgress(); };
    window.addEventListener('focus', onFocus);
    return () => { window.removeEventListener('focus', onFocus); };
  }, [refreshProgress]);

  const progressPercent = useMemo(() => getProgressPercent(config, moduleState), [config, moduleState]);

  const completedMap = useMemo(
    () =>
      Object.entries(moduleState.lessons).reduce<Record<string, boolean>>((acc, [id, status]) => {
        if (status === 'completed') acc[id] = true;
        return acc;
      }, {}),
    [moduleState.lessons]
  );

  const requiredLessonById = useMemo(
    () =>
      config.lessons.reduce<Record<string, string | null>>((acc, lesson) => {
        acc[lesson.id] = getRequiredLessonId(config, lesson.id, completedMap);
        return acc;
      }, {}),
    [config, completedMap]
  );

  const nextActiveLessonId = useMemo(() => {
    const found = config.lessons.find(
      (l) => moduleState.lessons[l.id] === 'in_progress' || moduleState.lessons[l.id] === 'available'
    );
    return found?.id ?? null;
  }, [config.lessons, moduleState.lessons]);

  const handleContinue = () => {
    if (nextActiveLessonId) nav(getLessonPath(config, nextActiveLessonId));
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-app)]">
      <PageHeader
        title={moduleTitle}
        onBack={() => nav('/app')}
        moduleColor={moduleColor}
        rightSlot={
          <div className="flex items-center gap-1">
            {gamification && <XPChip xp={gamification.xp} />}
            <StreakBadge streak={streak} />
          </div>
        }
      />

      <div className="p-4 pb-24 space-y-4">
        {/* Hero: porcentaje + barra de progreso */}
        <FECard variant="hero">
          <h2 className="text-base font-bold mb-3">Avance del módulo</h2>
          <div className="flex items-center gap-4 mb-3">
            <span className={`text-4xl font-black tabular-nums min-w-[72px] ${MODULE_TEXT_CLASS[moduleColor]}`}>
              {progressPercent}%
            </span>
            <div className="flex-1">
              <Progress
                value={progressPercent}
                barClassName={MODULE_BAR_CLASS[moduleColor]}
                className="mb-1"
              />
              <p className="text-xs text-[var(--color-text-secondary)]">
                Completa las lecciones en orden para avanzar.
              </p>
            </div>
          </div>

          {nextActiveLessonId && (
            <Button
              className={`w-full min-h-11 mt-1 ${MODULE_BUTTON_CLASS[moduleColor]}`}
              onClick={handleContinue}
            >
              <Play className="h-4 w-4" />
              Continuar: {nextActiveLessonId}
            </Button>
          )}

          {progressPercent === 100 && (
            <p className="mt-2 text-center text-sm font-bold text-[var(--color-brand-success)]">
              ¡Módulo completado!
            </p>
          )}
        </FECard>

        {/* Error de carga */}
        {loadError && (
          <FECard variant="flat" className="border-[var(--color-brand-error)]">
            <p className="font-bold text-[var(--color-brand-error)]">{loadError}</p>
          </FECard>
        )}

        {/* Skeleton de carga */}
        {loading && (
          <FECard variant="flat">
            <p className="text-sm text-[var(--color-text-secondary)]">Cargando progreso...</p>
          </FECard>
        )}

        {/* Lista de lecciones */}
        <FECard variant="flat">
          <ModuleLessonList
            lessons={config.lessons}
            lessonStatuses={moduleState.lessons as Record<string, LessonStatus>}
            requiredLessonById={requiredLessonById}
            onOpenLesson={(lessonId) => nav(getLessonPath(config, lessonId))}
          />
        </FECard>
      </div>
    </div>
  );
}
