// src/db/lessonProgress.repository.ts

import { useAuth } from '../store/auth';
import type { ModKey } from '../store/progress';
import { db } from './finempoderDb';
import type { LessonProgress } from './finempoderDb';
import { trackModuleCompleted } from '@/shared/utils/analytics';

const currentUserId = () => useAuth.getState().user?.id ?? 'local';

export const lessonProgressRepository = {
  /** Write completion to Dexie only — no network call. Use SyncManager to sync. */
  async setCompletedLocal(moduleId: ModKey, lessonId: string): Promise<void> {
    const userId = currentUserId();
    const existing = await db.lessonProgress.where({ userId, moduleId, lessonId }).first();
    const now = new Date().toISOString();

    if (existing) {
      await db.lessonProgress.update(existing.id!, { completed: true, completedAt: now });
    } else {
      const record: LessonProgress = { userId, moduleId, lessonId, completed: true, completedAt: now };
      await db.lessonProgress.add(record);
    }
  },

  /** Legacy: write local + direct API call (kept for existing LessonShell usage) */
  async setCompleted(moduleId: ModKey, lessonId: string): Promise<void> {
    await this.setCompletedLocal(moduleId, lessonId);
    // SyncManager handles the backend sync — imported lazily to avoid circular deps
    const { SyncManager } = await import('../lib/sync/SyncManager');
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
    const existing = await db.lessonProgress.where({ userId, moduleId, lessonId }).first();
    return !!existing?.completed;
  },

  async getModuleProgress(moduleId: ModKey): Promise<LessonProgress[]> {
    const userId = currentUserId();
    return db.lessonProgress.where({ userId, moduleId }).toArray();
  },

  async applyServerProgress(
    userId: string,
    moduleId: ModKey,
    lessonsCompleted: string[]
  ) {
    if (!userId) return;
    const completedSet = new Set(lessonsCompleted);
    const now = new Date().toISOString();

    for (const lessonId of completedSet) {
      const existing = await db.lessonProgress.where({ userId, moduleId, lessonId }).first();
      if (existing) {
        if (!existing.completed) {
          await db.lessonProgress.update(existing.id!, {
            completed: true,
            completedAt: existing.completedAt ?? now
          });
        }
      } else {
        const record: LessonProgress = {
          userId,
          moduleId,
          lessonId,
          completed: true,
          completedAt: now
        };
        await db.lessonProgress.add(record);
      }
    }
    if (lessonsCompleted.length >= 15) {
      trackModuleCompleted(moduleId);
    }
  }
};
