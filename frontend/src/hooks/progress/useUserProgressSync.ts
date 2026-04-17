import { useEffect } from 'react';
import progressApi from '../../api/progress/progress.api';
import { lessonProgressRepository } from '../../db/lessonProgress.repository';
import { useAuth } from '../../store/auth';
import { useLessons } from '../../store/lessons';
import type { ModKey } from '../../store/progress';
import { useProgress } from '../../store/progress';

const MODULES: ModKey[] = ['presupuesto', 'ahorro', 'inversion'];

export function useUserProgressSync() {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);
  const setModuleProgress = useProgress((s) => s.setModuleProgress);
  const hydrateStreak = useProgress((s) => s.hydrateStreak);
  const hydrateBudgetLessons = useLessons((s) => s.hydrateFromCompletionMap);

  useEffect(() => {
    if (!token || !userId) return;
    let cancelled = false;

    const syncAll = async () => {
      for (const moduleId of MODULES) {
        try {
          const data = await progressApi.fetchModuleProgress(moduleId);
          if (cancelled) return;
          setModuleProgress(moduleId, data.progressPercent ?? 0);
          await lessonProgressRepository.applyServerProgress(userId, moduleId, data.lessonsCompleted);
          if (moduleId === 'presupuesto') {
            const completedMap = data.lessonsCompleted.reduce<Record<string, boolean>>((acc, lessonId) => {
              acc[lessonId] = true;
              return acc;
            }, {});
            hydrateBudgetLessons(completedMap);
          }
          if (data.gamification) {
            hydrateStreak({
              current: data.gamification.streakCurrent,
              best: data.gamification.streakBest,
              lastActiveISO: data.gamification.lastActiveISO,
            });
          }
        } catch (err) {
          console.warn('[progress-sync] fallo sincronizando', moduleId, err);
        }
      }
    };

    void syncAll();

    return () => {
      cancelled = true;
    };
  }, [token, userId, setModuleProgress, hydrateStreak, hydrateBudgetLessons]);
}
