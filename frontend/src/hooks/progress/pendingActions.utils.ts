/**
 * Funciones puras de retry/stale que comparte el sistema de sincronización.
 * Este módulo proveería las utilidades test-friendly extraíbles del SyncManager.
 *
 * En el futuro, SyncManager puede importar desde aquí en lugar de definirlas inline.
 */

import type { PendingAction } from '../../db/finempoderDb';

export const MAX_RETRIES = 3;
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
export const BASE_DELAY_MS = 5_000;

/**
 * Devuelve true si la acción es demasiado antigua para ser sincronizada.
 */
export function isStale(action: Pick<PendingAction, 'createdAt'>): boolean {
  return Date.now() - new Date(action.createdAt).getTime() > MAX_AGE_MS;
}

/**
 * Devuelve true si el backoff expiró y se puede reintentar la acción.
 */
export function canRetryNow(action: Pick<PendingAction, 'retryCount' | 'lastTriedAt'>): boolean {
  const delay = BASE_DELAY_MS * Math.max(1, (action.retryCount ?? 0) + 1);
  const last = action.lastTriedAt ? new Date(action.lastTriedAt).getTime() : 0;
  return Date.now() - last >= delay;
}
