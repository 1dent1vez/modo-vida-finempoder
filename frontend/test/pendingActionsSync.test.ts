import { test, expect } from 'vitest';
import { isStale, canRetryNow, BASE_DELAY_MS } from '../src/hooks/progress/pendingActions.utils';
import type { PendingAction } from '../src/db/finempoderDb';

const baseAction: PendingAction = {
  userId: 'u1',
  type: 'lessonCompleted',
  resource: '/progress/lesson-completed',
  payload: {},
  createdAt: new Date().toISOString(),
  retryCount: 0,
  lastTriedAt: undefined,
};

test('isStale detects old actions', () => {
  const old: PendingAction = { ...baseAction, createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() };
  expect(isStale(old)).toBe(true);
});

test('canRetryNow respects backoff delay', () => {
  const action: PendingAction = { ...baseAction, retryCount: 1, lastTriedAt: new Date().toISOString() };
  expect(canRetryNow(action)).toBe(false);
  const past: PendingAction = {
    ...baseAction,
    retryCount: 1,
    lastTriedAt: new Date(Date.now() - BASE_DELAY_MS * 2).toISOString(),
  };
  expect(canRetryNow(past)).toBe(true);
});
