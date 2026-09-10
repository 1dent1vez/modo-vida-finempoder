import { describe, expect, it } from 'vitest';
import { initialMicroExpense, parseMicroExpense } from './microExpenseModel';

const ids = new Set(['a', 'b', 'c']);

describe('microExpenseModel', () => {
  it('crea una observación vacía y válida', () => {
    const draft = initialMicroExpense();
    expect(parseMicroExpense(draft, ids)).toEqual(draft);
  });

  it('rechaza cierres sin tres ejemplos y selecciones alteradas', () => {
    expect(
      parseMicroExpense({ version: 1, stage: 'review', selected: ['a', 'b'] }, ids),
    ).toBeNull();
    expect(
      parseMicroExpense({ version: 1, stage: 'observe', selected: ['a', 'x'] }, ids),
    ).toBeNull();
    expect(
      parseMicroExpense({ version: 1, stage: 'observe', selected: ['a', 'a'] }, ids),
    ).toBeNull();
  });
});
