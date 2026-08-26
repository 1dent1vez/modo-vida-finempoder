// @vitest-environment jsdom
// Tests de la lógica del nombre (F4-NOMBRE-PERFIL): flag "una sola vez" y
// validación del input (sin emojis, solo letras/espacios/guiones/apóstrofos).

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NAME_ASKED_KEY, isValidName, markNameAsked, nameAsked } from './namePrompt';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  localStorage.clear();
});

describe('flag fe_name_asked', () => {
  it('empieza sin preguntar y se marca una sola vez', () => {
    expect(nameAsked()).toBe(false);
    markNameAsked();
    expect(nameAsked()).toBe(true);
    expect(localStorage.getItem(NAME_ASKED_KEY)).toBe('1');
  });
});

describe('isValidName', () => {
  it('acepta nombres con acentos, ñ, espacios, guiones y apóstrofos', () => {
    expect(isValidName('Ana')).toBe(true);
    expect(isValidName('María José')).toBe(true);
    expect(isValidName('José María López-García')).toBe(true);
    expect(isValidName("L'Ana del Carmen")).toBe(true);
    expect(isValidName('O\u2019Brien')).toBe(true);
    expect(isValidName('  Ana García  ')).toBe(true);
  });

  it('rechaza vacío, solo espacios, emojis y caracteres raros', () => {
    expect(isValidName('')).toBe(false);
    expect(isValidName('   ')).toBe(false);
    expect(isValidName('Ana 😀')).toBe(false);
    expect(isValidName('Ana123')).toBe(false);
    expect(isValidName('Ana_María')).toBe(false);
    expect(isValidName('ana@finempoder.com')).toBe(false);
  });
});
