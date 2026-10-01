import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type DailyGoalLevel = 'relaxed' | 'regular' | 'intense';

export const DAILY_GOAL_XP: Record<DailyGoalLevel, number> = {
  relaxed: 100,
  regular: 200,
  intense: 300,
};

export const DAILY_GOAL_META: Record<DailyGoalLevel, { label: string; lessons: string }> = {
  relaxed: { label: 'Relajada', lessons: '~1 lección' },
  regular: { label: 'Regular', lessons: '~2 lecciones' },
  intense: { label: 'Intensa', lessons: '~3 lecciones' },
};

export const DAILY_GOAL_ORDER: DailyGoalLevel[] = ['relaxed', 'regular', 'intense'];

/** Nivel default en runtime cuando el usuario no eligió (spec: Regular sin bloquear la app). */
export const DEFAULT_DAILY_LEVEL: DailyGoalLevel = 'regular';

/** XP objetivo: sin elección (level null) se usa Regular, sin persistir. */
export function resolveDailyXpTarget(level: DailyGoalLevel | null): number {
  return DAILY_GOAL_XP[level ?? DEFAULT_DAILY_LEVEL];
}

export type DailyGoalState = {
  level: DailyGoalLevel | null;
  xpTarget: number;
  /** Day key local en que se celebró "¡Meta del día cumplida!" (una vez por día). */
  celebratedDay: string | null;
  setLevel: (level: DailyGoalLevel | null) => void;
  markCelebrated: (dayKey: string) => void;
};

export const useDailyGoal = create<DailyGoalState>()(
  persist(
    (set) => ({
      level: null,
      xpTarget: resolveDailyXpTarget(null),
      celebratedDay: null,
      setLevel: (level) => set({ level, xpTarget: resolveDailyXpTarget(level) }),
      markCelebrated: (dayKey) => set({ celebratedDay: dayKey }),
    }),
    {
      name: 'fe_daily_goal',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<DailyGoalState>;
        const level = p.level ?? null;
        return {
          ...current,
          ...p,
          level,
          xpTarget: resolveDailyXpTarget(level),
          celebratedDay: p.celebratedDay ?? null,
        };
      },
    }
  )
);
