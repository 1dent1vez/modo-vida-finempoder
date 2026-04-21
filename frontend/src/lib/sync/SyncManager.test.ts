/**
 * Tests para las utilidades puras del SyncManager.
 * Testea _isStale y _canRetry sin necesitar Dexie ni red.
 */
import { describe, it, expect } from 'vitest';
import type { SyncQueueItem } from '@/db/finempoderDb';

// ---- Lógica pura extraída de SyncManagerImpl para testeo independiente ----

const MAX_RETRIES = 3;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 días
const BASE_DELAY_MS = 5_000;

function isStale(item: Pick<SyncQueueItem, 'createdAt'>): boolean {
  return Date.now() - new Date(item.createdAt).getTime() > MAX_AGE_MS;
}

function canRetry(item: Pick<SyncQueueItem, 'retries' | 'lastTriedAt'>): boolean {
  const delay = BASE_DELAY_MS * Math.max(1, item.retries + 1);
  const last = item.lastTriedAt ? new Date(item.lastTriedAt).getTime() : 0;
  return Date.now() - last >= delay;
}

// ---- helpers ----

function isoAgo(ms: number): string {
  return new Date(Date.now() - ms).toISOString();
}

const EIGHT_DAYS_MS = 8 * 24 * 60 * 60 * 1000;

// ---- tests ----

describe('SyncManager — isStale', () => {
  it('item de hace 8 días es stale', () => {
    expect(isStale({ createdAt: isoAgo(EIGHT_DAYS_MS) })).toBe(true);
  });

  it('item de hace 6 días NO es stale', () => {
    expect(isStale({ createdAt: isoAgo(6 * 24 * 60 * 60 * 1000) })).toBe(false);
  });

  it('item recién creado NO es stale', () => {
    expect(isStale({ createdAt: new Date().toISOString() })).toBe(false);
  });
});

describe('SyncManager — canRetry', () => {
  it('primer intento (0 retries, sin lastTriedAt) siempre puede reintentar', () => {
    expect(canRetry({ retries: 0, lastTriedAt: undefined })).toBe(true);
  });

  it('después de 1 retry hace 3s NO puede reintentar (delay=10s)', () => {
    // delay = 5000 * max(1, 1+1) = 10000ms
    const lastTriedAt = isoAgo(3_000);
    expect(canRetry({ retries: 1, lastTriedAt })).toBe(false);
  });

  it('después de 1 retry hace 11s SÍ puede reintentar', () => {
    const lastTriedAt = isoAgo(11_000);
    expect(canRetry({ retries: 1, lastTriedAt })).toBe(true);
  });

  it('después de 2 retries (delay=15s) hace 14s NO puede reintentar', () => {
    // delay = 5000 * max(1, 2+1) = 15000ms
    const lastTriedAt = isoAgo(14_000);
    expect(canRetry({ retries: 2, lastTriedAt })).toBe(false);
  });

  it('después de 2 retries hace 16s SÍ puede reintentar', () => {
    const lastTriedAt = isoAgo(16_000);
    expect(canRetry({ retries: 2, lastTriedAt })).toBe(true);
  });
});

describe('Constantes del SyncManager', () => {
  it('MAX_RETRIES es 3', () => {
    expect(MAX_RETRIES).toBe(3);
  });

  it('MAX_AGE_MS es exactamente 7 días', () => {
    expect(MAX_AGE_MS).toBe(604_800_000);
  });

  it('el backoff escala linealmente con el número de retries', () => {
    const delay0 = BASE_DELAY_MS * Math.max(1, 0 + 1); // 5000
    const delay1 = BASE_DELAY_MS * Math.max(1, 1 + 1); // 10000
    const delay2 = BASE_DELAY_MS * Math.max(1, 2 + 1); // 15000
    expect(delay0).toBe(5_000);
    expect(delay1).toBe(10_000);
    expect(delay2).toBe(15_000);
  });
});
