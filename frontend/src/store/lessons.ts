import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BUDGET_LESSONS } from '../pages/modules/presupuesto/lessonFlow';
import { useProgress } from './progress';

export type Lesson = {
  id: string;
  title: string;
  kind: 'content' | 'quiz' | 'simulator' | 'challenge';
  completed: boolean;
  score?: number;
};

type State = {
  lessons: Lesson[];
  complete: (id: string, score?: number) => void;
  hydrateFromCompletionMap: (completedMap: Record<string, boolean>) => void;
  isUnlocked: (id: string) => boolean;
  moduleProgress: number;
  reset: () => void;
};

const initial: Lesson[] = BUDGET_LESSONS.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  kind: lesson.kind,
  completed: false,
}));

export const useLessons = create<State>()(
  persist(
    (set, get) => ({
      lessons: initial,
      moduleProgress: 0,
      reset: () => set({ lessons: initial, moduleProgress: 0 }),

      complete: (id, score) => {
        const updated = get().lessons.map((lesson) =>
          lesson.id === id ? { ...lesson, completed: true, score: score ?? lesson.score ?? 100 } : lesson
        );
        const completedCount = updated.filter((lesson) => lesson.completed).length;
        const pct = Math.round((completedCount / updated.length) * 100);

        set({ lessons: updated, moduleProgress: pct });
        useProgress.getState().setModuleProgress('presupuesto', pct);
        useProgress.getState().recordActivity('presupuesto', 0);
      },

      hydrateFromCompletionMap: (completedMap) => {
        const updated = get().lessons.map((lesson) => ({
          ...lesson,
          completed: lesson.completed || completedMap[lesson.id] === true,
        }));
        const completedCount = updated.filter((lesson) => lesson.completed).length;
        const pct = Math.round((completedCount / updated.length) * 100);
        set({ lessons: updated, moduleProgress: pct });
        useProgress.getState().setModuleProgress('presupuesto', pct);
      },

      isUnlocked: (id) => {
        const idx = get().lessons.findIndex((lesson) => lesson.id === id);
        if (idx <= 0) return true;
        return get().lessons[idx - 1]?.completed === true;
      },
    }),
    { name: 'fe_lessons_presupuesto' }
  )
);
