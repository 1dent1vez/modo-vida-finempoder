// Lógica pura de códigos y semana local (corre en node; TZ sweep vía
// process.env.TZ, mismo patrón que el streak: constructores LOCALES).
import { afterEach, describe, expect, it } from 'vitest';
import {
  generateInviteCode,
  INVITE_CODE_ALPHABET,
  isValidInviteCode,
  normalizeInviteCode,
  weekStartISO,
} from './leagueCode';

const ORIGINAL_TZ = process.env.TZ;

afterEach(() => {
  if (ORIGINAL_TZ === undefined) delete process.env.TZ;
  else process.env.TZ = ORIGINAL_TZ;
});

describe('generateInviteCode', () => {
  it('genera 200 códigos de 6 caracteres, todos del alfabeto sin ambiguos', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).toHaveLength(6);
      for (const ch of code) {
        expect(INVITE_CODE_ALPHABET).toContain(ch);
      }
    }
  });

  it('nunca contiene los ambiguos 0, I, O ni 1', () => {
    for (let i = 0; i < 200; i++) {
      const code = generateInviteCode();
      expect(code).not.toMatch(/[0IO1]/);
    }
  });

  it('genera códigos distintos entre llamadas (aleatoriedad real)', () => {
    const codes = new Set(Array.from({ length: 50 }, () => generateInviteCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('normalizeInviteCode / isValidInviteCode', () => {
  it('normaliza: recorta espacios y pasa a mayúsculas', () => {
    expect(normalizeInviteCode('  ab2cde ')).toBe('AB2CDE');
  });

  it('acepta un código válido del alfabeto', () => {
    expect(isValidInviteCode('ABC234')).toBe(true);
  });

  it('rechaza longitudes distintas a 6', () => {
    expect(isValidInviteCode('ABC23')).toBe(false);
    expect(isValidInviteCode('ABC2345')).toBe(false);
  });

  it('rechaza caracteres ambiguos O, 0, I y 1', () => {
    expect(isValidInviteCode('ABC23O')).toBe(false);
    expect(isValidInviteCode('ABC230')).toBe(false);
    expect(isValidInviteCode('ABC23I')).toBe(false);
    expect(isValidInviteCode('ABC231')).toBe(false);
  });

  it('rechaza caracteres fuera del alfabeto (ñ, guiones, espacios)', () => {
    expect(isValidInviteCode('ABC23Ñ')).toBe(false);
    expect(isValidInviteCode('ABC-23')).toBe(false);
    expect(isValidInviteCode('ABC 23')).toBe(false);
  });
});

describe('weekStartISO — lunes local de la semana', () => {
  it('domingo → el lunes de ESA semana', () => {
    // 9 ago 2026 es domingo (getDay() = 0); su lunes es el 3.
    expect(weekStartISO(new Date(2026, 7, 9, 12, 0))).toBe('2026-08-03');
  });

  it('miércoles → el lunes previo', () => {
    expect(weekStartISO(new Date(2026, 7, 12, 12, 0))).toBe('2026-08-10');
  });

  it('lunes → él mismo', () => {
    expect(weekStartISO(new Date(2026, 7, 10, 23, 59))).toBe('2026-08-10');
  });

  it('sábado → el lunes de su semana', () => {
    expect(weekStartISO(new Date(2026, 7, 15, 6, 0))).toBe('2026-08-10');
  });
});

describe('weekStartISO — TZ sweep (Mexico_City, UTC, Honolulu)', () => {
  const TZS = ['America/Mexico_City', 'UTC', 'Pacific/Honolulu'];

  for (const tz of TZS) {
    it(`domingo 23:30 local en ${tz} → lunes de ESA semana (no usa UTC)`, () => {
      process.env.TZ = tz;
      // 23:30 local del domingo: con toISOString (UTC) caería en el lunes UTC
      // y la semana se correría; el día de la liga es LOCAL.
      expect(weekStartISO(new Date(2026, 7, 9, 23, 30))).toBe('2026-08-03');
    });

    it(`domingo 00:30 local en ${tz} → lunes de ESA semana`, () => {
      process.env.TZ = tz;
      expect(weekStartISO(new Date(2026, 7, 9, 0, 30))).toBe('2026-08-03');
    });

    it(`cruce de año: lunes 28 dic 2026 en ${tz} → 2026-12-28`, () => {
      process.env.TZ = tz;
      expect(weekStartISO(new Date(2026, 11, 28, 10, 0))).toBe('2026-12-28');
    });
  }
});
