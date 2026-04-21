/**
 * Tests unitarios para gamificationHelpers.ts
 * computeLevel y applyStreak son funciones puras — sin Supabase, sin red.
 *
 * Correr con: npm test (usa tsx via cross-env)
 */

import { computeLevel, applyStreak, type GamificationRow } from '../src/lib/gamificationHelpers.js';
import assert from 'node:assert/strict';

// ---- helpers de test ----

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ ${name}`);
    console.error(`     ${(err as Error).message}`);
    failed++;
  }
}

function makeRow(overrides: Partial<GamificationRow> = {}): GamificationRow {
  return {
    id: 'test-id',
    user_id: 'user-1',
    xp: 0,
    level: 1,
    streak_current: 0,
    streak_best: 0,
    last_active_iso: null,
    module_progress: {},
    ...overrides,
  };
}

function dateIso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// ---- computeLevel ----

console.log('\n📐 computeLevel\n');

test('nivel 1 con 0 XP', () => {
  assert.equal(computeLevel(0), 1);
});

test('nivel 1 con 99 XP', () => {
  assert.equal(computeLevel(99), 1);
});

test('nivel 2 con 100 XP', () => {
  assert.equal(computeLevel(100), 2);
});

test('nivel 2 con 199 XP', () => {
  assert.equal(computeLevel(199), 2);
});

test('nivel 3 con 200 XP', () => {
  assert.equal(computeLevel(200), 3);
});

test('nivel 11 con 1000 XP', () => {
  assert.equal(computeLevel(1000), 11);
});

// ---- applyStreak — primer día ----

console.log('\n🔥 applyStreak — primer día\n');

test('primer día de actividad → streak_current = 1', () => {
  const row = makeRow({ streak_current: 0, streak_best: 0, last_active_iso: null });
  applyStreak(row, new Date());
  assert.equal(row.streak_current, 1);
  assert.equal(row.streak_best, 1);
});

test('misma fecha → no modifica la racha', () => {
  const today = dateIso(0);
  const row = makeRow({ streak_current: 5, streak_best: 7, last_active_iso: today });
  applyStreak(row, new Date());
  assert.equal(row.streak_current, 5);  // no cambia
  assert.equal(row.streak_best, 7);     // no cambia
  assert.equal(row.last_active_iso, today);
});

// ---- applyStreak — día consecutivo ----

console.log('\n🔥 applyStreak — día consecutivo\n');

test('actividad el día siguiente → incrementa streak', () => {
  const yesterday = dateIso(1);
  const row = makeRow({ streak_current: 3, streak_best: 5, last_active_iso: yesterday });
  applyStreak(row, new Date());
  assert.equal(row.streak_current, 4);
});

test('streak consecutivo actualiza best cuando supera el récord', () => {
  const yesterday = dateIso(1);
  const row = makeRow({ streak_current: 10, streak_best: 10, last_active_iso: yesterday });
  applyStreak(row, new Date());
  assert.equal(row.streak_current, 11);
  assert.equal(row.streak_best, 11);
});

// ---- applyStreak — racha rota ----

console.log('\n🔥 applyStreak — racha rota\n');

test('actividad después de 2+ días → reinicia a 1', () => {
  const twoDaysAgo = dateIso(2);
  const row = makeRow({ streak_current: 8, streak_best: 12, last_active_iso: twoDaysAgo });
  applyStreak(row, new Date());
  assert.equal(row.streak_current, 1);
  assert.equal(row.streak_best, 12);  // best no baja
});

test('best nunca disminuye aunque la racha se rompa', () => {
  const oldDate = dateIso(10);
  const row = makeRow({ streak_current: 20, streak_best: 20, last_active_iso: oldDate });
  applyStreak(row, new Date());
  assert.equal(row.streak_current, 1);
  assert.equal(row.streak_best, 20);
});

// ---- applyStreak — actualiza last_active_iso ----

console.log('\n🔥 applyStreak — last_active_iso\n');

test('last_active_iso se actualiza a la fecha de hoy', () => {
  const yesterday = dateIso(1);
  const row = makeRow({ last_active_iso: yesterday });
  const now = new Date();
  applyStreak(row, now);
  assert.equal(row.last_active_iso, now.toISOString().slice(0, 10));
});

// ---- resumen ----

console.log(`\n${'─'.repeat(40)}`);
console.log(`Total: ${passed + failed} | ✅ ${passed} passed | ${failed > 0 ? `❌ ${failed} failed` : '0 failed'}`);
console.log('─'.repeat(40));

if (failed > 0) process.exit(1);
