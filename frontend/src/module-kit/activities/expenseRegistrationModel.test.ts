import { describe, expect, it } from 'vitest';
import { initialExpenseRegistration, parseExpenseRegistration } from './expenseRegistrationModel';
const ids = new Set(['a', 'b']);
const methods = new Set(['app']);
describe('expenseRegistrationModel', () => {
  it('acepta el inicio y rechaza una revisión incompleta', () => {
    expect(parseExpenseRegistration(initialExpenseRegistration(), ids, methods)).toEqual(
      initialExpenseRegistration(),
    );
    expect(
      parseExpenseRegistration(
        {
          version: 1,
          stage: 'review',
          method: 'app',
          index: 1,
          records: { a: { category: 'A', payment: 'P', correct: true } },
        },
        ids,
        methods,
      ),
    ).toBeNull();
  });
});
