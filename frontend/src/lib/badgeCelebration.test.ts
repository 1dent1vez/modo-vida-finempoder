// @vitest-environment jsdom
/** Tests de logros vistos (F2-GAMIFICACION): storage local + cola de unlocks. */
import { beforeEach, describe, expect, it } from 'vitest';
import { buildBadgeStats, type BadgeStats } from '../data/badges';
import {
  computeUnlocks,
  readSeenBadges,
  SEEN_BADGES_KEY,
  writeSeenBadge,
} from './badgeCelebration';

const stats = (over: Partial<BadgeStats> = {}): BadgeStats =>
  buildBadgeStats({
    presupuestoProgress: 0,
    ahorroProgress: 0,
    inversionProgress: 0,
    streakBest: 0,
    streakCurrent: 0,
    ...over,
  });

beforeEach(() => {
  localStorage.clear();
});

describe('readSeenBadges / writeSeenBadge', () => {
  it('sin key devuelve {} (migración de legado)', () => {
    expect(readSeenBadges()).toEqual({});
  });

  it('persiste el tier visto por serie', () => {
    writeSeenBadge('racha', 2);
    expect(readSeenBadges()).toEqual({ racha: 2 });
    expect(JSON.parse(localStorage.getItem(SEEN_BADGES_KEY) ?? '{}')).toEqual({ racha: 2 });
  });

  it('tolera JSON corrupto devolviendo {}', () => {
    localStorage.setItem(SEEN_BADGES_KEY, '{no-json');
    expect(readSeenBadges()).toEqual({});
  });
});

describe('computeUnlocks', () => {
  it('un tier nuevo no visto encola la celebración', () => {
    const unlocks = computeUnlocks(stats({ presupuestoProgress: 30 }), {});
    expect(unlocks).toContainEqual({ serieId: 'presupuesto', nivel: 1 });
  });

  it('un tier ya visto no encola', () => {
    const unlocks = computeUnlocks(stats({ streakBest: 3 }), { racha: 1 });
    expect(unlocks).not.toContainEqual({ serieId: 'racha', nivel: 1 });
    expect(unlocks).toEqual([]);
  });

  it('solo encola el tier máximo logrado (no intermedios)', () => {
    const unlocks = computeUnlocks(stats({ presupuestoProgress: 100 }), {});
    expect(unlocks).toContainEqual({ serieId: 'presupuesto', nivel: 3 });
    expect(unlocks).not.toContainEqual({ serieId: 'presupuesto', nivel: 1 });
  });

  it('subir de tier (1 → 2) encola el nuevo nivel aunque el anterior ya se vio', () => {
    const unlocks = computeUnlocks(stats({ presupuestoProgress: 60 }), { presupuesto: 1 });
    expect(unlocks).toContainEqual({ serieId: 'presupuesto', nivel: 2 });
    expect(unlocks).not.toContainEqual({ serieId: 'presupuesto', nivel: 1 });
  });

  it('un usuario con todo visto no genera unlocks', () => {
    const todo = stats({ presupuestoProgress: 100, ahorroProgress: 100, inversionProgress: 100, streakBest: 14 });
    const seen = { presupuesto: 3, ahorro: 3, inversion: 3, racha: 3, lecciones: 3, finempoder_pro: 3 } as const;
    expect(computeUnlocks(todo, seen)).toEqual([]);
  });
});
