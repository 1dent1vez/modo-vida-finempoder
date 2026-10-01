import { describe, expect, it } from 'vitest';
import { initialSpendingAwareness, parseSpendingAwareness } from './spendingAwarenessModel';

const ids = new Set(['a', 'b']);
describe('spendingAwarenessModel', () => {
  it('acepta el estado inicial', () =>
    expect(parseSpendingAwareness(initialSpendingAwareness(), ids)).toEqual(
      initialSpendingAwareness(),
    ));
  it('rechaza revisión incompleta o respuestas desconocidas', () => {
    expect(
      parseSpendingAwareness(
        {
          version: 1,
          stage: 'review',
          expectation: 'Una semana',
          classifications: { a: 'planned' },
        },
        ids,
      ),
    ).toBeNull();
    expect(
      parseSpendingAwareness(
        {
          version: 1,
          stage: 'classify',
          expectation: 'Una semana',
          classifications: { x: 'planned' },
        },
        ids,
      ),
    ).toBeNull();
  });
});
