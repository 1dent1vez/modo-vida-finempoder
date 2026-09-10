import { describe, expect, it } from 'vitest';
import {
  initialSmartGoal,
  monthlyContribution,
  parseSmartGoal,
  validSmartGoal,
} from './smartGoalModel';
describe('smartGoalModel', () => {
  it('calcula el aporte y exige viabilidad explícita', () => {
    const goal = {
      ...initialSmartGoal(),
      goal: 'Una meta',
      amount: 3600,
      months: 6,
      reason: 'Razón suficiente',
    };
    expect(monthlyContribution(goal)).toBe(600);
    expect(validSmartGoal(goal)).toBe(false);
    expect(validSmartGoal({ ...goal, feasibility: 'unsure' })).toBe(true);
    expect(parseSmartGoal({ ...goal, stage: 'review' })).toBeNull();
  });
});
