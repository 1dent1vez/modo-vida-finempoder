// FinEmpoder — ModuleOverview unificado
// Reemplaza los 3 Overview.tsx por módulo. Recibe config + color + título.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import FECard from '../../components/FECard';
import { PageHeader } from '../../components/shared/PageHeader';
import { XPChip, StreakBadge } from '../../components/gamification';
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

export interface ModuleOverviewProps {
  config: ModuleFlowConfig;
  moduleColor: 'warning' | 'success' | 'info';
  moduleTitle: string;
  moduleIcon?: ReactNode;
}

export function ModuleOverview({ config, moduleColor, moduleTitle }: ModuleOverviewProps) {
  const nav = useNavigate();
  const moduleId = config.moduleId as ModKey;

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

  // Primera lección activa (in_progress o available) para el botón Continuar
  const nextActiveLessonId = useMemo(() => {
    const found = config.lessons.find(
      (l) => moduleState.lessons[l.id] === 'in_progress' || moduleState.lessons[l.id] === 'available'
    );
    return found?.id ?? null;
  }, [config.lessons, moduleState.lessons]);

  const handleContinue = () => {
    if (nextActiveLessonId) {
      nav(getLessonPath(config, nextActiveLessonId));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <PageHeader
        title={moduleTitle}
        onBack={() => nav('/app')}
        moduleColor={moduleColor}
        rightSlot={
          <Stack direction="row" spacing={1} alignItems="center">
            {gamification && <XPChip xp={gamification.xp} />}
            <StreakBadge streak={streak} />
          </Stack>
        }
      />

      <Box sx={{ p: 4, pb: 20 }}>
        {/* Hero: porcentaje + barra de progreso */}
        <FECard variant="hero" sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ mb: 1, color: `${moduleColor}.dark` }}>
            Avance del módulo
          </Typography>
          <Stack direction="row" alignItems="center" spacing={4} sx={{ mb: 2 }}>
            <Typography
              sx={{
                fontSize: '2rem',
                fontWeight: 900,
                color: `${moduleColor}.main`,
                minWidth: 72,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {progressPercent}%
            </Typography>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={progressPercent}
                color={moduleColor}
                sx={{ mb: 0.5 }}
              />
              <Typography variant="caption" color="text.secondary">
                Completa las lecciones en orden para avanzar.
              </Typography>
            </Box>
          </Stack>

          {/* Botón Continuar */}
          {nextActiveLessonId && (
            <Button
              variant="contained"
              color={moduleColor}
              size="large"
              fullWidth
              startIcon={<PlayArrowIcon />}
              onClick={handleContinue}
              sx={{ mt: 1 }}
            >
              Continuar: {nextActiveLessonId}
            </Button>
          )}

          {progressPercent === 100 && (
            <Typography variant="body2" color="success.main" fontWeight={700} sx={{ mt: 1, textAlign: 'center' }}>
              ¡Módulo completado!
            </Typography>
          )}
        </FECard>

        {/* Error de carga */}
        {loadError && (
          <FECard variant="flat" sx={{ mb: 3, borderColor: 'error.main' }}>
            <Typography color="error.main" fontWeight={700}>
              {loadError}
            </Typography>
          </FECard>
        )}

        {/* Skeleton de carga */}
        {loading && (
          <FECard variant="flat" sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Cargando progreso...
            </Typography>
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
      </Box>
    </Box>
  );
}
