import { describe, expect, it } from 'vitest';
import { balanceOf, initialBalance, parseBalance } from './balanceCalculatorModel';
describe('balanceCalculatorModel', () => {
  it('calcula y valida estados persistidos', () => {
    expect(balanceOf(initialBalance())).toBe(720);
    expect(parseBalance(initialBalance())).toEqual(initialBalance());
    expect(parseBalance({ ...initialBalance(), stage: 'review' })).toBeNull();
  });
});
