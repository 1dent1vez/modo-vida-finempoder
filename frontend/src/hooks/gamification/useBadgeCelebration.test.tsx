// @vitest-environment jsdom
/** Tests de la cola de celebración (F2-GAMIFICACION) con localStorage y
 *  fake timers para la secuencia lección → logro. */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgress } from '../../store/progress';
import { LESSON_COMPLETION_DELAY_MS, SEEN_BADGES_KEY } from '../../lib/badgeCelebration';
import { useBadgeCelebration } from './useBadgeCelebration';

function streakDeDias(dias: number) {
  useProgress.getState().hydrateStreak({
    current: dias,
    best: dias,
    lastActiveISO: '2026-08-09',
    shields: 0,
    metaDaysStreak: 0,
  });
}

function lessonCompletada(completedAt: number) {
  window.dispatchEvent(new CustomEvent('fe:lesson-completed', { detail: { completedAt } }));
}

beforeEach(() => {
  localStorage.clear();
  useProgress.getState().reset();
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('useBadgeCelebration — cola de logros', () => {
  it('un tier nuevo no visto encola y se muestra tras la lección', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());

    act(() => lessonCompletada(Date.now()));
    act(() => streakDeDias(3)); // racha Bronce (nada más se desbloquea)

    expect(result.current.waiting).toBe(true);
    act(() => vi.advanceTimersByTime(LESSON_COMPLETION_DELAY_MS));
    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });
  });

  it('tras "Seguir" no reaparece en la misma sesión', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());
    act(() => lessonCompletada(Date.now()));
    act(() => streakDeDias(3));
    act(() => vi.advanceTimersByTime(LESSON_COMPLETION_DELAY_MS));
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });

    act(() => result.current.acknowledge());
    expect(result.current.current).toBeNull();
    expect(JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) ?? '{}')).toEqual({ racha: 1 });

    // Mismo estado: no vuelve a encolar.
    act(() => useProgress.getState().recordActivity('presupuesto', 0));
    act(() => vi.advanceTimersByTime(LESSON_COMPLETION_DELAY_MS));
    expect(result.current.current).toBeNull();
  });

  it('un tier ya visto no encola', () => {
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify({ racha: 1 }));
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());
    act(() => lessonCompletada(Date.now()));
    act(() => streakDeDias(3));
    act(() => vi.advanceTimersByTime(LESSON_COMPLETION_DELAY_MS));
    expect(result.current.current).toBeNull();
  });

  it('al subir de tier encola el nuevo nivel y respeta la cola una a la vez', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());
    act(() => lessonCompletada(Date.now()));
    act(() => streakDeDias(3));
    act(() => vi.advanceTimersByTime(LESSON_COMPLETION_DELAY_MS));
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });

    act(() => result.current.acknowledge());
    act(() => streakDeDias(7));
    // El delay del evento anterior ya venció: el nuevo tier se muestra al momento.
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 2 });

    act(() => result.current.acknowledge());
    expect(result.current.current).toBeNull();
  });
});

describe('useBadgeCelebration — secuencia lección → logro', () => {
  it('ORDEN REAL: stats primero no abren el modal; el evento lo muestra tras el delay', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());

    // 1. Stats cambian PRIMERO (recordActivity → hydrate async): el unlock
    //    queda pendiente, pero el modal NO aparece.
    act(() => streakDeDias(3));
    act(() => vi.advanceTimersByTime(3000));
    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toBeNull();

    // 2. Llega el evento real de la lección (completedAt = Date.now()).
    act(() => lessonCompletada(Date.now()));
    expect(result.current.waiting).toBe(true);
    expect(result.current.current).toBeNull();

    // 3. El modal aparece SOLO tras el delay restante desde completedAt.
    act(() => vi.advanceTimersByTime(2499));
    expect(result.current.current).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });
  });

  it('ANTI-CASO: cambio de stats sin evento no abre el modal jamás', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());

    // Re-render por sync/hidratación sin evento de lección.
    act(() => streakDeDias(3));
    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toBeNull();

    // El unlock siguió pendiente: cuando llega el evento, recién ahí se muestra.
    act(() => lessonCompletada(Date.now()));
    act(() => vi.advanceTimersByTime(2499));
    expect(result.current.current).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });
  });
});
