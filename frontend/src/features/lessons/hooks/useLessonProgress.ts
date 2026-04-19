import { useCallback } from 'react';
import { lessonProgressRepository } from '@/db/lessonProgress.repository';
import { SyncManager } from '@/lib/sync/SyncManager';
import { useAuth } from '@/store/auth';
import type { ModKey } from '@/store/progress';

export function useLessonProgress(moduleId: ModKey, lessonId: string) {
  const userId = useAuth((s) => s.user?.id);

  const markComplete = useCallback(async () => {
    // 1. Write to Dexie immediately (offline-first)
    await lessonProgressRepository.setCompletedLocal(moduleId, lessonId);

    // 2. Enqueue for backend sync — SyncManager handles online/offline
    if (userId) {
      await SyncManager.enqueue('lesson_progress', userId, {
        moduleId,
        lessonId,
        completedAt: new Date().toISOString(),
      });
    }
  }, [moduleId, lessonId, userId]);

  return { markComplete };
}
