// @vitest-environment jsdom
/** Tests de la cola de celebración (F2-GAMIFICACION) con localStorage y
 *  fake timers para la secuencia lección → logro. */
import '@testing-library/jest-dom/vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProgress } from '../../store/progress';
import { SEEN_BADGES_KEY } from '../../lib/badgeCelebration';
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
  it('un tier nuevo no visto encola y se muestra', () => {
    const { result } = renderHook(() => useBadgeCelebration());
    expect(result.current.current).toBeNull();

    act(() => streakDeDias(3)); // racha Bronce (nada más se desbloquea)

    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });
  });

  it('tras "Seguir" no reaparece en la misma sesión', () => {
    const { result } = renderHook(() => useBadgeCelebration());
    act(() => streakDeDias(3));
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });

    act(() => result.current.acknowledge());
    expect(result.current.current).toBeNull();
    expect(JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) ?? '{}')).toEqual({ racha: 1 });

    // Mismo estado: no vuelve a encolar.
    act(() => useProgress.getState().recordActivity('presupuesto', 0));
    expect(result.current.current).toBeNull();
  });

  it('un tier ya visto no encola', () => {
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify({ racha: 1 }));
    const { result } = renderHook(() => useBadgeCelebration());
    act(() => streakDeDias(3));
    expect(result.current.current).toBeNull();
  });

  it('al subir de tier encola el nuevo nivel y respeta la cola una a la vez', () => {
    const { result } = renderHook(() => useBadgeCelebration());
    act(() => streakDeDias(3));
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });

    act(() => result.current.acknowledge());
    act(() => streakDeDias(7));
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 2 });

    act(() => result.current.acknowledge());
    expect(result.current.current).toBeNull();
  });
});

describe('useBadgeCelebration — secuencia lección → logro', () => {
  it('con evento de lección reciente, el modal espera el delay (no inmediato)', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());

    act(() => {
      window.dispatchEvent(
        new CustomEvent('fe:lesson-completed', { detail: { completedAt: Date.now() } })
      );
    });
    act(() => streakDeDias(3));

    expect(result.current.waiting).toBe(true);
    expect(result.current.current).toBeNull();

    act(() => vi.advanceTimersByTime(2499));
    expect(result.current.current).toBeNull();

    act(() => vi.advanceTimersByTime(1));
    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });
  });

  it('sin evento de lección reciente, el modal aparece de inmediato', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useBadgeCelebration());

    act(() => streakDeDias(3));

    expect(result.current.waiting).toBe(false);
    expect(result.current.current).toEqual({ serieId: 'racha', nivel: 1 });
  });
});
