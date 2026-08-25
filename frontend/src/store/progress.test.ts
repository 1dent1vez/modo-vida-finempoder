/**
 * Tests de racha con escudos (F1-OLA2) y day key LOCAL.
 * - Lógica pura: computeNextStreak / computeGoalStreak con day keys locales.
 * - Integración del store con fecha local fija (constructores locales,
 *   NUNCA instantes UTC fijos) para que pasen en cualquier zona horaria.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { addDaysLocal, daysAgoLocalKey, localDayKey } from '../lib/localDate';
import {
  computeGoalStreak,
  computeNextStreak,
  useProgress,
  type Streak,
} from './progress';

const baseStreak = (over: Partial<Streak> = {}): Streak => ({
  current: 0,
  best: 0,
  shields: 0,
  metaDaysStreak: 0,
  ...over,
});

// Fechas fijas en day key local (equivalen a un 9 de agosto, 8 y 7).
const TODAY = '2026-08-09';
const YESTERDAY = '2026-08-08';
const TWO_DAYS_AGO = '2026-08-07';
const THREE_DAYS_AGO = '2026-08-06';

describe('Day key LOCAL (base del freeze)', () => {
  it('usa getFullYear/getMonth/getDate locales, nunca UTC', () => {
    // En cualquier TZ, estas fechas locales corresponden a estos day keys.
    expect(localDayKey(new Date(2026, 7, 9, 0, 5))).toBe('2026-08-09');
    expect(localDayKey(new Date(2026, 0, 1, 0, 5))).toBe('2026-01-01');
    expect(localDayKey(new Date(2026, 7, 9, 23, 59))).toBe('2026-08-09');
  });

  it('aritmética de días con setDate local (hoy/ayer/anteayer)', () => {
    const today = new Date(2026, 7, 9, 0, 5);
    expect(daysAgoLocalKey(1, today)).toBe('2026-08-08');
    expect(daysAgoLocalKey(2, today)).toBe('2026-08-07');
    expect(localDayKey(addDaysLocal(today, -1))).toBe('2026-08-08');
  });
});

describe('computeNextStreak — racha con escudos', () => {
  it('primera vez: racha empieza en 1', () => {
    expect(computeNextStreak(baseStreak(), TODAY, YESTERDAY, TWO_DAYS_AGO)).toMatchObject({
      current: 1,
      best: 1,
    });
  });

  it('día consecutivo: incrementa en 1', () => {
    const prev = baseStreak({ current: 3, best: 5, lastActiveISO: YESTERDAY });
    const result = computeNextStreak(prev, TODAY, YESTERDAY, TWO_DAYS_AGO);
    expect(result.current).toBe(4);
    expect(result.best).toBe(5);
  });

  it('mismo día: mantiene la racha (y normaliza 0 a 1)', () => {
    expect(
      computeNextStreak(
        baseStreak({ current: 4, best: 7, lastActiveISO: TODAY }),
        TODAY,
        YESTERDAY,
        TWO_DAYS_AGO
      )
    ).toMatchObject({ current: 4, best: 7 });
    expect(
      computeNextStreak(baseStreak({ current: 0, lastActiveISO: TODAY }), TODAY, YESTERDAY, TWO_DAYS_AGO)
        .current
    ).toBe(1);
  });

  it('gap de 1 día CON escudo: consume el escudo y la racha NO se rompe', () => {
    const prev = baseStreak({
      current: 4,
      best: 6,
      shields: 1,
      lastActiveISO: TWO_DAYS_AGO,
    });
    const result = computeNextStreak(prev, TODAY, YESTERDAY, TWO_DAYS_AGO);
    expect(result.current).toBe(5);
    expect(result.shields).toBe(0);
  });

  it('gap de 1 día SIN escudo: la racha se rompe (current = 1)', () => {
    const prev = baseStreak({ current: 4, best: 9, shields: 0, lastActiveISO: TWO_DAYS_AGO });
    const result = computeNextStreak(prev, TODAY, YESTERDAY, TWO_DAYS_AGO);
    expect(result.current).toBe(1);
    expect(result.best).toBe(9); // el best no baja
  });

  it('gap de 2+ días: rompe aunque haya escudo (los escudos no cubren gaps de 2+)', () => {
    const prev = baseStreak({ current: 4, best: 8, shields: 2, lastActiveISO: THREE_DAYS_AGO });
    const result = computeNextStreak(prev, TODAY, YESTERDAY, TWO_DAYS_AGO);
    expect(result.current).toBe(1);
    expect(result.shields).toBe(2); // el escudo NO se consume
  });

  it('metaDaysStreak se conserva si ayer hubo actividad Y meta; si no, se reinicia', () => {
    const conMeta = baseStreak({
      current: 2,
      best: 2,
      lastActiveISO: YESTERDAY,
      metaDaysStreak: 4,
      lastGoalDay: YESTERDAY,
    });
    expect(computeNextStreak(conMeta, TODAY, YESTERDAY, TWO_DAYS_AGO).metaDaysStreak).toBe(4);

    const sinMeta = baseStreak({
      current: 2,
      best: 2,
      lastActiveISO: YESTERDAY,
      metaDaysStreak: 4,
      lastGoalDay: THREE_DAYS_AGO,
    });
    expect(computeNextStreak(sinMeta, TODAY, YESTERDAY, TWO_DAYS_AGO).metaDaysStreak).toBe(0);

    const conGap = baseStreak({
      current: 2,
      best: 2,
      lastActiveISO: TWO_DAYS_AGO,
      metaDaysStreak: 4,
      lastGoalDay: YESTERDAY,
    });
    expect(computeNextStreak(conGap, TODAY, YESTERDAY, TWO_DAYS_AGO).metaDaysStreak).toBe(0);
  });
});

describe('computeGoalStreak — escudos cada 3 metas consecutivas', () => {
  it('primer día con meta: metaDaysStreak = 1 y sin escudo', () => {
    expect(computeGoalStreak(baseStreak(), TODAY, YESTERDAY)).toEqual({
      shields: 0,
      metaDaysStreak: 1,
    });
  });

  it('día consecutivo con meta: incrementa el contador', () => {
    const prev = baseStreak({ metaDaysStreak: 1, lastGoalDay: YESTERDAY });
    expect(computeGoalStreak(prev, TODAY, YESTERDAY)).toEqual({
      shields: 0,
      metaDaysStreak: 2,
    });
  });

  it('si ayer NO fue de meta, el contador reinicia a 1', () => {
    const prev = baseStreak({ metaDaysStreak: 5, lastGoalDay: TWO_DAYS_AGO });
    expect(computeGoalStreak(prev, TODAY, YESTERDAY).metaDaysStreak).toBe(1);
  });

  it('otorga 1 escudo cada 3 días consecutivos con meta', () => {
    const prev = baseStreak({ metaDaysStreak: 2, lastGoalDay: YESTERDAY });
    expect(computeGoalStreak(prev, TODAY, YESTERDAY)).toEqual({
      shields: 1,
      metaDaysStreak: 3,
    });
  });

  it('nunca supera 2 escudos', () => {
    const prev = baseStreak({
      shields: 2,
      metaDaysStreak: 5,
      lastGoalDay: YESTERDAY,
    });
    expect(computeGoalStreak(prev, TODAY, YESTERDAY)).toEqual({
      shields: 2,
      metaDaysStreak: 6,
    });
  });

  it('idempotente: si ya se marcó hoy, no vuelve a contar', () => {
    const prev = baseStreak({ shields: 1, metaDaysStreak: 2, lastGoalDay: TODAY });
    expect(computeGoalStreak(prev, TODAY, YESTERDAY)).toEqual({
      shields: 1,
      metaDaysStreak: 2,
    });
  });
});

describe('Store — recordActivity y markDailyGoalReached con fecha local fija', () => {
  beforeEach(() => {
    useProgress.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
    useProgress.getState().reset();
  });

  it('recordActivity consume un escudo al faltar exactamente ayer (no rompe la racha)', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0));

    useProgress.getState().hydrateStreak({
      current: 4,
      best: 6,
      lastActiveISO: daysAgoLocalKey(2),
      shields: 1,
      metaDaysStreak: 0,
    });
    useProgress.getState().recordActivity('presupuesto', 0);

    const streak = useProgress.getState().streak;
    expect(streak.current).toBe(5);
    expect(streak.shields).toBe(0);
    expect(streak.lastActiveISO).toBe('2026-08-09');
    expect(useProgress.getState().todayDone).toBe(true);
  });

  it('recordActivity en día consecutivo incrementa la racha', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0));

    useProgress.getState().hydrateStreak({
      current: 2,
      best: 5,
      lastActiveISO: daysAgoLocalKey(1),
      shields: 1,
      metaDaysStreak: 0,
    });
    useProgress.getState().recordActivity('ahorro', 0);

    expect(useProgress.getState().streak.current).toBe(3);
    expect(useProgress.getState().streak.shields).toBe(1);
  });

  it('markDailyGoalReached acumula metaDaysStreak y otorga escudo en el día 3', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 9, 12, 0));

    useProgress.getState().hydrateStreak({
      current: 3,
      best: 3,
      lastActiveISO: daysAgoLocalKey(1),
      shields: 0,
      metaDaysStreak: 2,
      lastGoalDay: daysAgoLocalKey(1),
    });
    useProgress.getState().markDailyGoalReached();

    const streak = useProgress.getState().streak;
    expect(streak.metaDaysStreak).toBe(3);
    expect(streak.shields).toBe(1);
    expect(streak.lastGoalDay).toBe('2026-08-09');

    // Idempotente en el mismo día
    useProgress.getState().markDailyGoalReached();
    expect(useProgress.getState().streak.metaDaysStreak).toBe(3);
    expect(useProgress.getState().streak.shields).toBe(1);
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
