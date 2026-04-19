import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { lessonProgressRepository } from '../../db/lessonProgress.repository';
import { useAuth } from '../../store/auth';
import { useLessons } from '../../store/lessons';
import type { ModKey } from '../../store/progress';
import { useProgress } from '../../store/progress';

const MODULES: ModKey[] = ['presupuesto', 'ahorro', 'inversion'];
const MODULE_TOTALS: Record<ModKey, number> = { presupuesto: 15, ahorro: 15, inversion: 15 };

export function useUserProgressSync() {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);
  const setModuleProgress = useProgress((s) => s.setModuleProgress);
  const hydrateBudgetLessons = useLessons((s) => s.hydrateFromCompletionMap);

  useEffect(() => {
    if (!token || !userId) return;
    let cancelled = false;

    const syncAll = async () => {
      for (const moduleId of MODULES) {
        try {
          const { data: rows } = await supabase
            .from('lesson_progress')
            .select('lesson_id')
            .eq('user_id', userId)
            .eq('module_id', moduleId)
            .eq('completed', true);

          if (cancelled) return;

          const lessonsCompleted = (rows ?? []).map((r) => r.lesson_id as string);
          const total = MODULE_TOTALS[moduleId];
          const progressPercent = Math.min(100, Math.round((lessonsCompleted.length / total) * 100));

          setModuleProgress(moduleId, progressPercent);
          await lessonProgressRepository.applyServerProgress(userId, moduleId, lessonsCompleted);

          if (moduleId === 'presupuesto') {
            const completedMap = lessonsCompleted.reduce<Record<string, boolean>>((acc, id) => {
              acc[id] = true;
              return acc;
            }, {});
            hydrateBudgetLessons(completedMap);
          }
        } catch (err) {
          console.warn('[progress-sync] fallo sincronizando', moduleId, err);
        }
      }
    };

    void syncAll();

    return () => { cancelled = true; };
  }, [token, userId, setModuleProgress, hydrateBudgetLessons]);
}
