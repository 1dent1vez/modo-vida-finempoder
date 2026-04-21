/**
 * Tests para la lógica de racha (streak) del store de progreso.
 * La lógica vive en recordActivity() y hydrateStreak() — funciones puras sin side effects de red.
 */
import { describe, it, expect } from 'vitest';

// ---- utilidades de fecha (extraídas del store para tests independientes) ----

const toISO = (d: Date) => d.toISOString().slice(0, 10);

function calcNextStreak(
  prevCurrent: number,
  prevBest: number,
  lastActiveISO: string | undefined,
  today: string,
): { current: number; best: number } {
  const yesterday = toISO(new Date(today + 'T12:00:00Z'));
  const d = new Date(yesterday);
  d.setDate(d.getDate() - 1);
  const prevDay = toISO(d);

  let nextCurrent: number;
  if (lastActiveISO === today) {
    nextCurrent = prevCurrent || 1;
  } else if (lastActiveISO === prevDay) {
    nextCurrent = (prevCurrent || 0) + 1;
  } else {
    nextCurrent = 1;
  }

  return {
    current: nextCurrent,
    best: Math.max(nextCurrent, prevBest),
  };
}

// ---- helpers de fecha para tests ----

function dateStr(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return toISO(d);
}

const TODAY = dateStr(0);
const YESTERDAY = dateStr(1);
const TWO_DAYS_AGO = dateStr(2);

// ---- tests ----

describe('Streak logic', () => {
  describe('calcNextStreak — primer día', () => {
    it('empieza en 1 si no hay actividad previa', () => {
      const result = calcNextStreak(0, 0, undefined, TODAY);
      expect(result.current).toBe(1);
      expect(result.best).toBe(1);
    });

    it('empieza en 1 si la última actividad fue hace 2+ días', () => {
      const result = calcNextStreak(5, 7, TWO_DAYS_AGO, TODAY);
      expect(result.current).toBe(1);
      expect(result.best).toBe(7); // el best no baja
    });
  });

  describe('calcNextStreak — día consecutivo', () => {
    it('incrementa en 1 si la última actividad fue ayer', () => {
      const result = calcNextStreak(3, 5, YESTERDAY, TODAY);
      expect(result.current).toBe(4);
    });

    it('actualiza best cuando supera el récord', () => {
      const result = calcNextStreak(10, 10, YESTERDAY, TODAY);
      expect(result.current).toBe(11);
      expect(result.best).toBe(11);
    });
  });

  describe('calcNextStreak — mismo día', () => {
    it('mantiene la racha si ya hubo actividad hoy', () => {
      const result = calcNextStreak(4, 7, TODAY, TODAY);
      expect(result.current).toBe(4);
      expect(result.best).toBe(7);
    });

    it('normaliza racha 0 a 1 si la última actividad es hoy pero current=0', () => {
      const result = calcNextStreak(0, 0, TODAY, TODAY);
      expect(result.current).toBe(1);
    });
  });

  describe('best nunca baja', () => {
    it('conserva el best histórico aunque la racha se rompa', () => {
      const result = calcNextStreak(10, 14, TWO_DAYS_AGO, TODAY);
      expect(result.current).toBe(1);
      expect(result.best).toBe(14);
    });
  });
});

describe('Clamp de progreso de módulo (0..100)', () => {
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

  it('clampea valores negativos a 0', () => {
    expect(clamp(-50)).toBe(0);
  });

  it('clampea valores mayores de 100 a 100', () => {
    expect(clamp(150)).toBe(100);
  });

  it('redondea decimales', () => {
    expect(clamp(73.6)).toBe(74);
  });

  it('acepta 0 y 100 exactos', () => {
    expect(clamp(0)).toBe(0);
    expect(clamp(100)).toBe(100);
  });
});
