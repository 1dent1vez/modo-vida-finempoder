// src/db/lessonProgress.repository.ts

import { useAuth } from '../store/auth';
import type { ModKey } from '../store/progress';
import { db } from './finempoderDb';
import type { LessonProgress } from './finempoderDb';
import { trackModuleCompleted } from '@/shared/utils/analytics';
import { SyncManager } from '../lib/sync/SyncManager';

const currentUserId = () => useAuth.getState().user?.id ?? 'local';

export const lessonProgressRepository = {
  /** Write completion to Dexie only — no network call. Use SyncManager to sync. */
  async setCompletedLocal(moduleId: ModKey, lessonId: string): Promise<void> {
    const userId = currentUserId();
    await db.transaction('rw', db.lessonProgress, async () => {
      const existing = await db.lessonProgress
        .where('[userId+moduleId+lessonId]')
        .equals([userId, moduleId, lessonId])
        .first();
      const record: LessonProgress = {
        userId,
        moduleId,
        lessonId,
        completed: true,
        completedAt: new Date().toISOString(),
      };
      await db.lessonProgress.put(existing?.id ? { ...record, id: existing.id } : record);
    });
  },

  /** Legacy: write local + direct API call (kept for existing LessonShell usage) */
  async setCompleted(moduleId: ModKey, lessonId: string): Promise<void> {
    await this.setCompletedLocal(moduleId, lessonId);
    const userId = currentUserId();
    if (userId !== 'local') {
      await SyncManager.enqueue('lesson_progress', userId, {
        moduleId,
        lessonId,
        completedAt: new Date().toISOString(),
      });
    }
  },

  async isCompleted(moduleId: ModKey, lessonId: string): Promise<boolean> {
    const userId = currentUserId();
    const existing = await db.lessonProgress
      .where('[userId+moduleId+lessonId]')
      .equals([userId, moduleId, lessonId])
      .first();
    return !!existing?.completed;
  },

  async getModuleProgress(moduleId: ModKey): Promise<LessonProgress[]> {
    const userId = currentUserId();
    return db.lessonProgress.where({ userId, moduleId }).toArray();
  },

  async applyServerProgress(userId: string, moduleId: ModKey, lessonsCompleted: string[]) {
    if (!userId) return;
    const completedSet = new Set(lessonsCompleted);
    const now = new Date().toISOString();

    await db.transaction('rw', db.lessonProgress, async () => {
      for (const lessonId of completedSet) {
        const existing = await db.lessonProgress
          .where('[userId+moduleId+lessonId]')
          .equals([userId, moduleId, lessonId])
          .first();
        const record: LessonProgress = {
          userId,
          moduleId,
          lessonId,
          completed: true,
          completedAt: existing?.completedAt ?? now,
        };
        await db.lessonProgress.put(existing?.id ? { ...record, id: existing.id } : record);
      }
    });
    if (lessonsCompleted.length >= 15) {
      trackModuleCompleted(moduleId);
    }
  },
};
