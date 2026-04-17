import type { PendingAction } from '../../db/finempoderDb';

export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
export const MAX_RETRIES = 5;
export const BASE_DELAY_MS = 5000; // 5s base, se incrementa con retryCount

export const isStale = (action: PendingAction) => {
  const created = new Date(action.createdAt).getTime();
  return Number.isFinite(created) && Date.now() - created > MAX_AGE_MS;
};

export const canRetryNow = (action: PendingAction) => {
  const count = action.retryCount ?? 0;
  const delay = BASE_DELAY_MS * Math.max(1, count + 1);
  const last = action.lastTriedAt ? new Date(action.lastTriedAt).getTime() : 0;
  return Date.now() - last >= delay;
};
