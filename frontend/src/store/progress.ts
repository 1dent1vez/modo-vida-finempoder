import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Claves de módulos que maneja FinEmpoder */
export type ModKey = 'presupuesto' | 'ahorro' | 'inversion';

/** Progreso por módulo (0..100) */
export type ModuleProgress = {
  progress: number;
};

/** Estado de racha global de estudio */
export type Streak = {
  current: number;          // racha actual (días seguidos)
  best: number;             // mejor racha histórica
  lastActiveISO?: string;   // última fecha con actividad (YYYY-MM-DD)
};

/** Estado del store de progreso */
export type ProgressState = {
  modules: Record<ModKey, ModuleProgress>;
  streak: Streak;
  /** true si ya hubo actividad hoy (útil para el chip “Hecho hoy”) */
  todayDone: boolean;

  /** Fija el progreso (0..100) del módulo */
  setModuleProgress: (key: ModKey, pct: number) => void;

  /**
   * Registra actividad de estudio:
   * - Actualiza la racha (current/best) considerando hoy/ayer
   * - Marca todayDone = true
   * - (Opcional) suma progreso Δ al módulo (clamp 0..100)
   */
  recordActivity: (key: ModKey, deltaProgress?: number) => void;

  /** Resetea todo el progreso y rachas (solo para depuración) */
  reset: () => void;

  /** Hidrata racha global desde backend (gamificación) */
  hydrateStreak: (remote: Partial<Streak>) => void;
};

/* ---------------------- utilidades de fecha ---------------------- */

const toISO = (d: Date) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const todayISO = () => toISO(new Date());
const yesterdayISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toISO(d);
};

/* ---------------------- estado inicial ---------------------- */

const initialModules: Record<ModKey, ModuleProgress> = {
  presupuesto: { progress: 0 },
  ahorro: { progress: 0 },
  inversion: { progress: 0 },
};

const initialStreak: Streak = {
  current: 0,
  best: 0,
  lastActiveISO: undefined,
};

/* ---------------------- store ---------------------- */

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      modules: initialModules,
      streak: initialStreak,
      todayDone: false,

      setModuleProgress: (key, pct) => {
        const clamped = Math.max(0, Math.min(100, Math.round(pct)));
        set((s) => ({
          modules: { ...s.modules, [key]: { progress: clamped } },
        }));
      },

      recordActivity: (key, deltaProgress = 0) => {
        const state = get();
        const mod = state.modules[key] ?? { progress: 0 };

        // --- Progreso del módulo
        const nextProgress = Math.max(
          0,
          Math.min(100, Math.round(mod.progress + deltaProgress))
        );

        // --- Racha global
        const today = todayISO();
        const yesterday = yesterdayISO();
        const prev = state.streak;

        let nextCurrent = prev.current;
        let nextBest = prev.best;

        if (prev.lastActiveISO === today) {
          // Ya hubo actividad hoy: mantenemos la racha
          nextCurrent = prev.current || 1; // por si venía 0
        } else if (prev.lastActiveISO === yesterday) {
          // Día consecutivo
          nextCurrent = (prev.current || 0) + 1;
        } else {
          // Se rompió la racha o primera vez
          nextCurrent = 1;
        }

        if (nextCurrent > (nextBest || 0)) nextBest = nextCurrent;

        set(() => ({
          modules: { ...state.modules, [key]: { progress: nextProgress } },
          streak: { current: nextCurrent, best: nextBest, lastActiveISO: today },
          todayDone: true,
        }));
      },

      reset: () => set({ modules: initialModules, streak: initialStreak, todayDone: false }),

      hydrateStreak: (remote) =>
        set((state) => {
          const merged: Streak = {
            current: remote.current ?? state.streak.current,
            best: remote.best ?? state.streak.best,
            lastActiveISO: remote.lastActiveISO ?? state.streak.lastActiveISO,
          };
          const today = todayISO();
          const todayDone = merged.lastActiveISO === today ? true : state.todayDone;
          return { streak: merged, todayDone };
        }),
    }),
    { name: 'fe_progress' }
  )
);
