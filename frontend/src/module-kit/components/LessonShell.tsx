// FinEmpoder — LessonShell unificado
// Versión única que reemplaza las 3 copias por módulo.
// Cada módulo provee su config; la lógica de acceso y persistencia es idéntica.

import { Box, Stack, Typography, Fade, Button } from '@mui/material';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import FECard from '../../components/FECard';
import FinniMessage from '../../components/FinniMessage';
import { PageHeader } from '../../components/shared/PageHeader';
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
import { MODULE_COLORS } from '../../theme';

/** Props que las lecciones (L01…L15) usan directamente — sin moduleId ni config */
export type LessonShellCoreProps = {
  id: string;
  title: string;
  children: ReactNode;
  completeWhen?: boolean;
  score?: number;
  completion?: LessonCompletion;
};

/** Props completas del shell unificado */
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

  // Hidratación inicial al montar
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

  // Persistencia de completitud cuando completeWhen se activa
  useEffect(() => {
    if (checkingAccess || !completion.ready || completed || isLocked || once.current) return;

    once.current = true;
    setPersisting(true);
    setCompleted(true);

    const persistCompletion = async () => {
      try {
        await lessonProgressRepository.setCompleted(moduleId, props.id);

        // Legacy store: evitar duplicados
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
  const moduleColor = MODULE_COLORS[moduleId];

  const goNext = () => {
    if (nextPath) { nav(nextPath); return; }
    nav(config.overviewPath);
  };

  const goOverview = () => nav(config.overviewPath);

  if (checkingAccess) {
    return (
      <>
        <PageHeader title={props.title} onBack={goOverview} moduleColor={moduleColor} />
        <Box sx={{ p: 4, pb: 20 }}>
          <FECard variant="flat" sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Validando acceso y progreso...
            </Typography>
          </FECard>
        </Box>
      </>
    );
  }

  if (isLocked) {
    return (
      <>
        <PageHeader title={props.title} onBack={goOverview} moduleColor={moduleColor} />
        <Box sx={{ p: 4, pb: 20 }}>
          <LockedLessonScreen
            requiredLessonId={requiredLessonId}
            onGoRequiredLesson={(lessonId) => nav(getLessonPath(config, lessonId))}
            onGoOverview={goOverview}
          />
        </Box>
      </>
    );
  }

  return (
    <>
      <PageHeader title={props.title} onBack={goOverview} moduleColor={moduleColor} />
      <Box sx={{ p: 4, pb: 20 }}>
        <FECard variant="flat" sx={{ mt: 3 }}>
          {props.children}
        </FECard>

        {completed && (
          <Fade in>
            <Box sx={{ mt: 4 }}>
              <FinniMessage
                variant="success"
                title="Leccion completada"
                message={
                  nextLessonId
                    ? `Desbloqueaste ${nextLessonId}. Puedes continuar cuando quieras.`
                    : 'Completaste este bloque del modulo.'
                }
              />
              {persisting && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                  Guardando progreso...
                </Typography>
              )}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 3 }}
              >
                {previousPath && (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => nav(previousPath)}
                    sx={{ minHeight: 44, minWidth: { sm: 140 } }}
                  >
                    Anterior
                  </Button>
                )}
                {nextPath && (
                  <Button
                    variant="contained"
                    color={moduleColor}
                    startIcon={<ArrowForwardIcon />}
                    onClick={goNext}
                    sx={{ minHeight: 44, minWidth: { sm: 140 } }}
                  >
                    Siguiente
                  </Button>
                )}
                <Button
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={goOverview}
                  sx={{ minHeight: 44, minWidth: { sm: 160 } }}
                >
                  Menu del modulo
                </Button>
              </Stack>
            </Box>
          </Fade>
        )}
      </Box>
    </>
  );
}
