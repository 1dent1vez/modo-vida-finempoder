/**
 * Tests de evaluación de series/tiers (F2-GAMIFICACION).
 * - Stats exactas → tier exacto (por módulo, racha y lecciones).
 * - maxTier 0 si nada logrado; corona solo con 3 módulos al 100%.
 * - Migración: stats de un usuario con las badges viejas → maxTier correcto.
 */
import { describe, expect, it } from 'vitest';
import { BADGES, buildBadgeStats, maxTier } from './badges';
import type { BadgeSeries, BadgeStats, TierLevel } from './badges';

const baseStats = (over: Partial<BadgeStats> = {}): BadgeStats => ({
  totalCompleted: 0,
  presupuestoProgress: 0,
  ahorroProgress: 0,
  inversionProgress: 0,
  streakBest: 0,
  streakCurrent: 0,
  ...over,
});

function serie(id: string): BadgeSeries {
  const found = BADGES.find((s) => s.id === id);
  if (!found) throw new Error(`Serie no encontrada: ${id}`);
  return found;
}

function tier(id: string, s: BadgeStats): 0 | TierLevel {
  return maxTier(serie(id), s);
}

describe('Evaluación por módulo (30/60/100)', () => {
  it.each([
    ['presupuestoProgress', 29, 0],
    ['presupuestoProgress', 30, 1],
    ['presupuestoProgress', 59, 1],
    ['presupuestoProgress', 60, 2],
    ['presupuestoProgress', 99, 2],
    ['presupuestoProgress', 100, 3],
  ] as const)('%s al %s%% → tier %s', (key, pct, expected) => {
    expect(tier('presupuesto', baseStats({ [key]: pct }))).toBe(expected);
  });

  it('ahorro e inversion usan sus propios progresos', () => {
    const s = baseStats({ ahorroProgress: 60, inversionProgress: 100 });
    expect(tier('ahorro', s)).toBe(2);
    expect(tier('inversion', s)).toBe(3);
    expect(tier('presupuesto', s)).toBe(0);
  });
});

describe('Evaluación de racha (3/7/14 sobre streakBest)', () => {
  it.each([
    [2, 0],
    [3, 1],
    [6, 1],
    [7, 2],
    [13, 2],
    [14, 3],
  ] as const)('streakBest %s días → tier %s', (days, expected) => {
    expect(tier('racha', baseStats({ streakBest: days }))).toBe(expected);
  });
});

describe('Evaluación de lecciones (1/10/25 sobre totalCompleted)', () => {
  it.each([
    [0, 0],
    [1, 1],
    [9, 1],
    [10, 2],
    [24, 2],
    [25, 3],
  ] as const)('totalCompleted %s → tier %s', (total, expected) => {
    expect(tier('lecciones', baseStats({ totalCompleted: total }))).toBe(expected);
  });
});

describe('Day 1 garantizado', () => {
  it('la primera lección completada dispara lecciones Bronce', () => {
    // 1 lección de 15 = 7% del módulo → totalCompleted derivado = 1.
    const s = buildBadgeStats({
      presupuestoProgress: 7,
      ahorroProgress: 0,
      inversionProgress: 0,
      streakBest: 0,
      streakCurrent: 0,
    });
    expect(s.totalCompleted).toBe(1);
    expect(tier('lecciones', s)).toBe(1);
  });
});

describe('maxTier 0 y corona', () => {
  it('devuelve 0 cuando no hay nada logrado', () => {
    for (const b of BADGES) {
      expect(maxTier(b, baseStats())).toBe(0);
    }
  });

  it('la corona solo se logra con los 3 módulos al 100%', () => {
    const casi = baseStats({ presupuestoProgress: 100, ahorroProgress: 100, inversionProgress: 99 });
    expect(tier('finempoder_pro', casi)).toBe(0);
    const completa = baseStats({ presupuestoProgress: 100, ahorroProgress: 100, inversionProgress: 100 });
    expect(tier('finempoder_pro', completa)).toBe(3);
    // Otros módulos al 100% no activan la corona.
    expect(tier('finempoder_pro', baseStats({ presupuestoProgress: 100 }))).toBe(0);
  });
});

describe('Migración: badges viejas → tiers nuevos (derivado del progreso real)', () => {
  it('first_step → lecciones Bronce', () => {
    expect(tier('lecciones', baseStats({ totalCompleted: 1 }))).toBe(1);
  });

  it('budget_explorer 50% → presupuesto Bronce; subir a 60% da Plata automático', () => {
    expect(tier('presupuesto', baseStats({ presupuestoProgress: 50 }))).toBe(1);
    expect(tier('presupuesto', baseStats({ presupuestoProgress: 60 }))).toBe(2);
  });

  it('budget_master → presupuesto Oro', () => {
    expect(tier('presupuesto', baseStats({ presupuestoProgress: 100 }))).toBe(3);
  });

  it('savings_champion → ahorro Oro', () => {
    expect(tier('ahorro', baseStats({ ahorroProgress: 100 }))).toBe(3);
  });

  it('investor → inversion Oro', () => {
    expect(tier('inversion', baseStats({ inversionProgress: 100 }))).toBe(3);
  });

  it('streak_3 → racha Bronce; streak_7 → racha Plata', () => {
    expect(tier('racha', baseStats({ streakBest: 3 }))).toBe(1);
    expect(tier('racha', baseStats({ streakBest: 7 }))).toBe(2);
  });

  it('ten_lessons → lecciones Plata', () => {
    expect(tier('lecciones', baseStats({ totalCompleted: 10 }))).toBe(2);
  });

  it('finempoder_pro → corona Oro', () => {
    expect(
      tier('finempoder_pro', baseStats({ presupuestoProgress: 100, ahorroProgress: 100, inversionProgress: 100 }))
    ).toBe(3);
  });

  it('buildBadgeStats conserva el cálculo histórico de totalCompleted', () => {
    const s = buildBadgeStats({
      presupuestoProgress: 100,
      ahorroProgress: 100,
      inversionProgress: 100,
      streakBest: 0,
      streakCurrent: 0,
    });
    expect(s.totalCompleted).toBe(45);
  });
});
