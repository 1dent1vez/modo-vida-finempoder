import { describe, expect, it } from 'vitest';
import { initialEmotional, parseEmotional } from './emotionalSpendingModel';

const scenarios = new Set(['a', 'b']);
const triggers = new Set(['stress']);
const strategies = new Set(['pause']);

describe('emotionalSpendingModel', () => {
  it('recupera un borrador válido', () => {
    const draft = { ...initialEmotional(), index: 1, answers: { a: 'planned' as const } };
    expect(parseEmotional(draft, scenarios, triggers, strategies)).toEqual(draft);
  });

  it('rechaza una revisión incompleta o valores ajenos al catálogo', () => {
    expect(
      parseEmotional(
        { ...initialEmotional(), stage: 'review', strategy: 'pause' },
        scenarios,
        triggers,
        strategies,
      ),
    ).toBeNull();
    expect(
      parseEmotional(
        { ...initialEmotional(), triggers: ['unknown'] },
        scenarios,
        triggers,
        strategies,
      ),
    ).toBeNull();
  });
});
