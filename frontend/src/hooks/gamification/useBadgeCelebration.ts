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
 * - Los unlocks pendientes esperan el evento 'fe:lesson-completed' (emitido
 *   por LessonShell): un re-render de stats solo no abre el modal.
 * - Al llegar el evento espera ~2.5s para no pisar el confetti/XP de la lección.
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
    [modules, streak],
  );

  const [queue, setQueue] = useState<BadgeUnlock[]>([]);
  const [current, setCurrent] = useState<BadgeUnlock | null>(null);
  const [waiting, setWaiting] = useState(false);
  const reserved = useRef<Set<string>>(new Set());
  // Timestamp del último 'fe:lesson-completed' (emitido por LessonShell).
  // null = el evento real aún no llegó; la cola queda pendiente.
  const [lastLessonAt, setLastLessonAt] = useState<number | null>(null);

  useEffect(() => {
    const onLessonCompleted = (event: Event) => {
      const detail = (event as CustomEvent<{ completedAt?: number }>).detail;
      setLastLessonAt(detail?.completedAt ?? Date.now());
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

  // Muestra el siguiente de la cola. Sin evento real de lección la cola queda
  // pendiente; al llegar el evento espera el delay restante (2.5s desde él).
  useEffect(() => {
    if (current !== null || queue.length === 0) return;
    if (lastLessonAt === null) return;
    const next = queue[0];
    const delay = Math.max(0, lastLessonAt + LESSON_COMPLETION_DELAY_MS - Date.now());
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
  }, [current, queue, lastLessonAt]);

  const acknowledge = useCallback(() => {
    if (!current) return;
    writeSeenBadge(current.serieId, current.nivel);
    reserved.current.delete(current.serieId);
    setCurrent(null);
  }, [current]);

  return { current, waiting, acknowledge };
}
