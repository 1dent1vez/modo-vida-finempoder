import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildBadgeStats } from '../../data/badges';
import { useProgress } from '../../store/progress';
import {
  computeUnlocks,
  LESSON_COMPLETION_DELAY_MS,
  readSeenBadges,
  writeSeenBadge,
  type BadgeUnlock,
} from '../../lib/badgeCelebration';

export type BadgeCelebrationState = {
  /** Logro actualmente en pantalla (null = nada que mostrar). */
  current: BadgeUnlock | null;
  /** true mientras el modal espera el delay post-lección. */
  waiting: boolean;
  /** Marca el logro como visto y avanza a la siguiente celebración. */
  acknowledge: () => void;
};

/**
 * Registro global de desbloqueo de logros (F2-GAMIFICACION).
 * - Observa stats reales (useProgress modules + streak + totalCompleted).
 * - Compara tier logrado vs tier visto ('fe_badges_state') y encola
 *   celebraciones UNA a la vez.
 * - Si el unlock coincide con el evento 'fe:lesson-completed' (emitido por
 *   LessonShell), espera ~2.5s para no pisar el confetti/XP de la lección.
 * - 'Seguir' marca el tier como visto; no reaparece en sesiones siguientes.
 */
export function useBadgeCelebration(): BadgeCelebrationState {
  const modules = useProgress((s) => s.modules);
  const streak = useProgress((s) => s.streak);

  const stats = useMemo(
    () =>
      buildBadgeStats({
        presupuestoProgress: modules.presupuesto?.progress ?? 0,
        ahorroProgress: modules.ahorro?.progress ?? 0,
        inversionProgress: modules.inversion?.progress ?? 0,
        streakBest: streak.best ?? 0,
        streakCurrent: streak.current ?? 0,
      }),
    [modules, streak]
  );

  const [queue, setQueue] = useState<BadgeUnlock[]>([]);
  const [current, setCurrent] = useState<BadgeUnlock | null>(null);
  const [waiting, setWaiting] = useState(false);
  const reserved = useRef<Set<string>>(new Set());
  const lastLessonAt = useRef<number | null>(null);

  // Timestamp del último 'fe:lesson-completed' (emitido por LessonShell).
  useEffect(() => {
    const onLessonCompleted = (event: Event) => {
      const detail = (event as CustomEvent<{ completedAt?: number }>).detail;
      lastLessonAt.current = detail?.completedAt ?? Date.now();
    };
    window.addEventListener('fe:lesson-completed', onLessonCompleted);
    return () => window.removeEventListener('fe:lesson-completed', onLessonCompleted);
  }, []);

  // Encola unlocks nuevos (tier logrado > tier visto), reservándolos para no
  // duplicarlos mientras esperan en cola.
  useEffect(() => {
    const unlocks = computeUnlocks(stats, readSeenBadges());
    const fresh = unlocks.filter((u) => !reserved.current.has(u.serieId));
    if (fresh.length === 0) return;
    fresh.forEach((u) => reserved.current.add(u.serieId));
    setQueue((prev) => [...prev, ...fresh]);
  }, [stats]);

  // Muestra el siguiente de la cola. Si el unlock coincide con la celebración
  // de una lección, espera el delay restante (2.5s desde el evento).
  useEffect(() => {
    if (current !== null || queue.length === 0) return;
    const next = queue[0];
    let delay = 0;
    if (lastLessonAt.current !== null) {
      delay = Math.max(0, lastLessonAt.current + LESSON_COMPLETION_DELAY_MS - Date.now());
    }
    if (delay > 0) {
      setWaiting(true);
      const timer = window.setTimeout(() => {
        setWaiting(false);
        setCurrent(next);
        setQueue((prev) => prev.slice(1));
      }, delay);
      return () => window.clearTimeout(timer);
    }
    setCurrent(next);
    setQueue((prev) => prev.slice(1));
  }, [current, queue]);

  const acknowledge = useCallback(() => {
    if (!current) return;
    writeSeenBadge(current.serieId, current.nivel);
    reserved.current.delete(current.serieId);
    setCurrent(null);
  }, [current]);

  return { current, waiting, acknowledge };
}
