import { describe, expect, it } from 'vitest';
import { initialCrisisDraft, parseCrisisDraft } from './crisisResponseModel';

const questions = new Set(['a', 'b']);
const plans = new Set(['map']);

describe('crisisResponseModel', () => {
  it('recupera un avance válido', () => {
    const draft = { ...initialCrisisDraft(), storyIndex: 1 };
    expect(parseCrisisDraft(draft, 3, questions, plans)).toEqual(draft);
  });

  it('rechaza una revisión sin respuestas o con un plan desconocido', () => {
    expect(
      parseCrisisDraft(
        { ...initialCrisisDraft(), stage: 'review', plan: 'map' },
        3,
        questions,
        plans,
      ),
    ).toBeNull();
    expect(
      parseCrisisDraft({ ...initialCrisisDraft(), plan: 'other' }, 3, questions, plans),
    ).toBeNull();
  });
});
