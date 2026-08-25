// @vitest-environment jsdom
// Tests de la lógica pura de compartir logros (F3-CRECIMIENTO).
// Reglas duras: sin emojis, sin rayas largas, voz natural.

import { describe, expect, it } from 'vitest';
import type { BadgeStats } from '../data/badges';
import { buildAchievementShareMessage, serieDatoReal, waMeUrl } from './shareAchievement';

const STATS: BadgeStats = {
  totalCompleted: 12,
  presupuestoProgress: 40,
  ahorroProgress: 60,
  inversionProgress: 25,
  streakBest: 7,
  streakCurrent: 3,
};

const EMOJI_RE = /[\p{Extended_Pictographic}\u{FE0F}]/u;
const LONG_DASH_RE = /[—–]/;

describe('buildAchievementShareMessage', () => {
  it('incluye el título del logro y suena natural', () => {
    const message = buildAchievementShareMessage('Lecciones completadas · Bronce');
    expect(message).toContain('Lecciones completadas · Bronce');
    expect(message).toContain('FinEMPODER');
    expect(message).toContain('¿la pruebas?');
  });

  it('no contiene emojis ni rayas largas', () => {
    const message = buildAchievementShareMessage('Presupuestación · Oro');
    expect(message).not.toMatch(EMOJI_RE);
    expect(message).not.toMatch(LONG_DASH_RE);
  });
});

describe('waMeUrl', () => {
  it('codifica el texto con encodeURIComponent y usa el dominio wa.me', () => {
    const message = 'Hola mundo ¿cómo estás?';
    expect(waMeUrl(message)).toBe(`https://wa.me/?text=${encodeURIComponent(message)}`);
  });

  it('queda lista para abrirse como link de WhatsApp', () => {
    const url = waMeUrl(buildAchievementShareMessage('Ahorro · Plata'));
    expect(url).toMatch(/^https:\/\/wa\.me\/\?text=/);
    expect(decodeURIComponent(url.split('text=')[1])).toContain('Ahorro · Plata');
  });
});

describe('serieDatoReal', () => {
  it('muestra el % del módulo para presupuesto, ahorro e inversion', () => {
    expect(serieDatoReal('presupuesto', STATS)).toBe('40% del módulo');
    expect(serieDatoReal('ahorro', STATS)).toBe('60% del módulo');
    expect(serieDatoReal('inversion', STATS)).toBe('25% del módulo');
  });

  it('muestra el total de lecciones para la serie lecciones', () => {
    expect(serieDatoReal('lecciones', STATS)).toBe('12 lecciones');
  });

  it('muestra la mejor racha en días', () => {
    expect(serieDatoReal('racha', STATS)).toBe('Racha de 7 días');
  });

  it('muestra los 3 módulos completos para la corona', () => {
    expect(serieDatoReal('finempoder_pro', STATS)).toBe('3 módulos completos');
  });
});
