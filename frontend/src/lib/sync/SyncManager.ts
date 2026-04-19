import { db, type SyncQueueItem, type SyncType } from '@/db/finempoderDb';
import client from '@/api/client';
import { useAuth } from '@/store/auth';
import { useNotifications } from '@/store/notifications';
import { trackLessonCompleted } from '@/shared/utils/analytics';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

const MAX_RETRIES = 3;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const BASE_DELAY_MS = 5_000;
const SYNCED_DISPLAY_MS = 3_000;

class SyncManagerImpl {
  private _status: SyncStatus = 'idle';
  private _flushing = false;
  private _initialized = false;
  private _listeners = new Set<(s: SyncStatus) => void>();

  init(): void {
    if (this._initialized) return;
    this._initialized = true;
    window.addEventListener('online', () => void this.flush());
    if (navigator.onLine) void this.flush();
  }

  getStatus(): SyncStatus {
    return this._status;
  }

  subscribe(cb: (s: SyncStatus) => void): () => void {
    this._listeners.add(cb);
    return () => this._listeners.delete(cb);
  }

  async enqueue(type: SyncType, userId: string, payload: Record<string, unknown>): Promise<void> {
    await db.syncQueue.add({
      userId,
      type,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
      status: 'pending',
    });
    if (navigator.onLine) void this.flush();
  }

  async flush(): Promise<void> {
    if (this._flushing || !navigator.onLine) return;

    const userId = useAuth.getState().user?.id;
    if (!userId) return;

    const pending = await db.syncQueue
      .where({ userId, status: 'pending' })
      .sortBy('createdAt');

    if (pending.length === 0) return;

    this._flushing = true;
    this._setStatus('syncing');

    let anyFailed = false;
    let anySuccess = false;

    for (const item of pending) {
      if (!navigator.onLine) break;
      if (this._isStale(item)) {
        if (item.id != null) await db.syncQueue.delete(item.id);
        continue;
      }
      if (!this._canRetry(item)) continue;

      try {
        await this._dispatch(item);
        if (item.id != null) await db.syncQueue.delete(item.id);
        anySuccess = true;
      } catch {
        const retries = item.retries + 1;
        if (retries >= MAX_RETRIES) {
          if (item.id != null) {
            await db.syncQueue.update(item.id, { status: 'failed', retries });
          }
          useNotifications
            .getState()
            .enqueue('No se pudo sincronizar un progreso. Inténtalo más tarde.', 'error');
          anyFailed = true;
        } else {
          if (item.id != null) {
            await db.syncQueue.update(item.id, {
              retries,
              lastTriedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    this._flushing = false;

    if (anyFailed) {
      this._setStatus('error');
    } else if (anySuccess) {
      this._setStatus('synced');
      setTimeout(() => this._setStatus('idle'), SYNCED_DISPLAY_MS);
    } else {
      this._setStatus('idle');
    }
  }

  private _setStatus(s: SyncStatus): void {
    this._status = s;
    this._listeners.forEach((cb) => cb(s));
  }

  private _isStale(item: SyncQueueItem): boolean {
    return Date.now() - new Date(item.createdAt).getTime() > MAX_AGE_MS;
  }

  private _canRetry(item: SyncQueueItem): boolean {
    const delay = BASE_DELAY_MS * Math.max(1, item.retries + 1);
    const last = item.lastTriedAt ? new Date(item.lastTriedAt).getTime() : 0;
    return Date.now() - last >= delay;
  }

  private async _dispatch(item: SyncQueueItem): Promise<void> {
    switch (item.type) {
      case 'lesson_progress':
        await client.post('/progress/lesson-completed', item.payload);
        trackLessonCompleted(
          item.payload.moduleId as string,
          item.payload.lessonId as string,
        );
        break;
      // xp_update and streak_update are derived server-side from lesson completion
      case 'xp_update':
      case 'streak_update':
        break;
    }
  }
}

export const SyncManager = new SyncManagerImpl();
