import { test, expect } from 'vitest';
import { useProgress } from '../src/store/progress';

test('recordActivity increments streak and todayDone', () => {
  useProgress.setState((s) => ({
    ...s,
    streak: { current: 0, best: 0, lastActiveISO: undefined },
    todayDone: false,
    modules: { presupuesto: { progress: 0 }, ahorro: { progress: 0 }, inversion: { progress: 0 } },
  }));

  useProgress.getState().recordActivity('presupuesto', 10);
  const state = useProgress.getState();

  expect(state.modules.presupuesto.progress).toBe(10);
  expect(state.streak.current).toBe(1);
  expect(state.todayDone).toBe(true);
});
