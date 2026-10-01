import { describe, expect, it } from 'vitest';

import { DAILY_GOAL_XP, resolveDailyXpTarget } from './dailyGoal';

describe('Meta diaria — default en runtime', () => {
  it('sin elección (level null) usa Regular (200 XP) sin persistir', () => {
    expect(resolveDailyXpTarget(null)).toBe(DAILY_GOAL_XP.regular);
    expect(resolveDailyXpTarget(null)).toBe(200);
  });

  it('respeta los XP objetivo por nivel', () => {
    expect(resolveDailyXpTarget('relaxed')).toBe(100);
    expect(resolveDailyXpTarget('regular')).toBe(200);
    expect(resolveDailyXpTarget('intense')).toBe(300);
  });
});
