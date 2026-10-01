import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { daysAgoLocalKey, localDayKey } from '../lib/localDate';

/** Claves de módulos que maneja FinEmpoder */
export type ModKey = 'presupuesto' | 'ahorro' | 'inversion';

/** Progreso por módulo (0..100) */
export type ModuleProgress = {
  progress: number;
};

/** Estado de racha global de estudio (F1-OLA2: escudos + días de meta). */
export type Streak = {
  current: number;              // racha actual (días seguidos)
  best: number;                 // mejor racha histórica
  /** Última fecha con actividad. Desde F1-OLA2 es day key LOCAL (YYYY-MM-DD).
   *  Se conserva el nombre por compatibilidad con el backend (last_active_iso). */
  lastActiveISO?: string;
  /** Escudos disponibles (máx. 2). Un escudo salva la racha si faltas UN día. */
  shields: number;
  /** Días consecutivos alcanzando la meta diaria; cada 3 → +1 escudo. */
  metaDaysStreak: number;
  /** Day key LOCAL del último día en que se alcanzó la meta diaria. */
  lastGoalDay?: string;
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

  /**
   * Marca la meta diaria como cumplida HOY (day key local). Idempotente por día:
   * suma a metaDaysStreak si ayer fue de meta, otorga escudo cada 3 días
   * consecutivos (máx. 2). Lo llama Home al detectar xp del día >= meta.
   */
  markDailyGoalReached: () => void;
};

/* ---------------------- lógica pura de racha (testeable) ---------------------- */

export type StreakUpdate = Pick<Streak, 'current' | 'best' | 'shields' | 'metaDaysStreak'>;

/**
 * Regla de racha con escudos (F1-OLA2):
 * - Mismo día: se mantiene.
 * - Ayer: +1 (día consecutivo).
 * - Anteayer con escudo: consume 1 escudo y la racha NO se rompe (+1, como si ayer hubiera activado).
 * - Anteayer sin escudo: se rompe (current = 1).
 * - Gap de 2+ días o primera vez: se rompe (current = 1); los escudos NO cubren gaps de 2+ días.
 * metaDaysStreak: se reinicia a 0 cuando el día entre la última actividad y hoy no fue de meta
 * (actividad no consecutiva, o ayer hubo actividad pero sin meta cumplida).
 */
export function computeNextStreak(
  prev: Streak,
  today: string,
  yesterday: string,
  anteayer: string
): StreakUpdate {
  let nextCurrent: number;
  let nextShields = prev.shields;

  if (prev.lastActiveISO === today) {
    nextCurrent = prev.current || 1;
  } else if (prev.lastActiveISO === yesterday) {
    nextCurrent = (prev.current || 0) + 1;
  } else if (prev.lastActiveISO === anteayer && prev.shields > 0) {
    nextCurrent = (prev.current || 0) + 1;
    nextShields = prev.shields - 1;
  } else {
    nextCurrent = 1;
  }

  const nextMetaDays =
    prev.lastActiveISO === today
      ? prev.metaDaysStreak
      : prev.lastActiveISO === yesterday && prev.lastGoalDay === yesterday
        ? prev.metaDaysStreak
        : 0;

  return {
    current: nextCurrent,
    best: Math.max(nextCurrent, prev.best),
    shields: nextShields,
    metaDaysStreak: nextMetaDays,
  };
}

/**
 * Meta cumplida HOY: +1 a metaDaysStreak si ayer también fue de meta (si no,
 * reinicia a 1); cada 3 días consecutivos con meta → +1 escudo (máx. 2).
 * Idempotente por día (si lastGoalDay ya es hoy, no cambia nada).
 */
export function computeGoalStreak(
  prev: Streak,
  today: string,
  yesterday: string
): Pick<Streak, 'shields' | 'metaDaysStreak'> {
  if (prev.lastGoalDay === today) {
    return { shields: prev.shields, metaDaysStreak: prev.metaDaysStreak };
  }
  const metaDaysStreak = prev.lastGoalDay === yesterday ? prev.metaDaysStreak + 1 : 1;
  const shields =
    metaDaysStreak % 3 === 0 && prev.shields < 2 ? prev.shields + 1 : prev.shields;
  return { shields, metaDaysStreak };
}

/**
 * F2-GAMIFICACION: la racha se PERDIÓ cuando venía de >= 2 días y el
 * siguiente estado la reinicia a 1 por un gap sin escudos (o gap de 2+).
 * Las primeras actividades (0 → 1) y el consumo de escudo (racha continúa)
 * NO cuentan como pérdida. El store emite 'fe:streak-lost' para que Finni
 * acompañe con una frase de ánimo (ver GlobalSnackbar).
 */
export function isStreakLoss(prev: Streak, update: StreakUpdate): boolean {
  return prev.current >= 2 && update.current === 1;
}

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
  shields: 0,
  metaDaysStreak: 0,
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

        // --- Racha global (day key LOCAL)
        const today = localDayKey(new Date());
        const streakUpdate = computeNextStreak(
          state.streak,
          today,
          daysAgoLocalKey(1),
          daysAgoLocalKey(2)
        );

        if (isStreakLoss(state.streak, streakUpdate) && typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('fe:streak-lost'));
        }

        set(() => ({
          modules: { ...state.modules, [key]: { progress: nextProgress } },
          streak: { ...state.streak, ...streakUpdate, lastActiveISO: today },
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
            shields: remote.shields ?? state.streak.shields ?? 0,
            metaDaysStreak: remote.metaDaysStreak ?? state.streak.metaDaysStreak ?? 0,
            lastGoalDay: remote.lastGoalDay ?? state.streak.lastGoalDay,
          };
          const today = localDayKey(new Date());
          const todayDone = merged.lastActiveISO === today ? true : state.todayDone;
          return { streak: merged, todayDone };
        }),

      markDailyGoalReached: () => {
        const state = get();
        const today = localDayKey(new Date());
        const yesterday = daysAgoLocalKey(1);
        const goal = computeGoalStreak(state.streak, today, yesterday);
        set({
          streak: { ...state.streak, ...goal, lastGoalDay: today },
        });
      },
    }),
    {
      name: 'fe_progress',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressState>;
        return {
          ...current,
          ...p,
          streak: {
            ...current.streak,
            ...(p.streak ?? {}),
            shields: p.streak?.shields ?? 0,
            metaDaysStreak: p.streak?.metaDaysStreak ?? 0,
          },
        };
      },
    }
  )
);
