// src/db/lessonProgress.repository.ts

import client from '../api/client';
import { useAuth } from '../store/auth';
import type { ModKey } from '../store/progress';
import { db } from './finempoderDb';
import type { LessonProgress } from './finempoderDb';
import { pendingActionsRepository } from './pendingActions.repository';
import { trackLessonCompleted, trackModuleCompleted } from '../utils/analytics';
import { useNotifications } from '../store/notifications';

const currentUserId = () => useAuth.getState().user?.id ?? 'local';

export const lessonProgressRepository = {
  async setCompleted(moduleId: ModKey, lessonId: string) {
    const userId = currentUserId();
    const existing = await db.lessonProgress.where({ userId, moduleId, lessonId }).first();
    const now = new Date().toISOString();

    if (existing) {
      await db.lessonProgress.update(existing.id!, {
        userId,
        completed: true,
        completedAt: now
      });
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

    // Intentar sincronizar con backend (offline-first)
    try {
      await client.post('/progress/lesson-completed', {
        moduleId,
        lessonId,
        completedAt: now
      });
      trackLessonCompleted(moduleId, lessonId);
    } catch (err) {
      console.warn('[progress] no se pudo sincronizar con backend; queda en local', err);
      if (userId !== 'local') {
        await pendingActionsRepository.addLessonCompleted(userId, {
          moduleId,
          lessonId,
          completedAt: now
        });
        useNotifications.getState().enqueue('Sin conexión: se sincronizará cuando vuelva la red.', 'warning');
      }
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
