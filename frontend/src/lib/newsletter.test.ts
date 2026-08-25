// @vitest-environment jsdom
// Tests de la lógica del newsletter (F3-CRECIMIENTO): suma de tiers, flag
// "una sola vez" y validación de email.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { SEEN_BADGES_KEY } from './badgeCelebration';
import {
  isValidEmail,
  markNewsletterAsked,
  newsletterAsked,
  sumaTiersExplorados,
} from './newsletter';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('sumaTiersExplorados', () => {
  it('suma los tiers vistos en fe_badges_state', () => {
    localStorage.setItem(
      SEEN_BADGES_KEY,
      JSON.stringify({ racha: 1, lecciones: 1, presupuesto: 1 }),
    );
    expect(sumaTiersExplorados()).toBe(3);
  });

  it('suma 3 para la corona (un solo tier Oro)', () => {
    localStorage.setItem(SEEN_BADGES_KEY, JSON.stringify({ finempoder_pro: 3 }));
    expect(sumaTiersExplorados()).toBe(3);
  });

  it('devuelve 0 sin estado previo', () => {
    expect(sumaTiersExplorados()).toBe(0);
  });
});

describe('flag fe_newsletter_asked', () => {
  it('empieza sin preguntar y se marca una sola vez', () => {
    expect(newsletterAsked()).toBe(false);
    markNewsletterAsked();
    expect(newsletterAsked()).toBe(true);
  });
});

describe('isValidEmail', () => {
  it('acepta correos válidos', () => {
    expect(isValidEmail('algo@correo.com')).toBe(true);
    expect(isValidEmail('  nombre.apellido+tag@sub.dominio.mx ')).toBe(true);
  });

  it('rechaza correos inválidos', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('algo@correo')).toBe(false);
    expect(isValidEmail('algo correo.com')).toBe(false);
    expect(isValidEmail('@correo.com')).toBe(false);
  });
});
