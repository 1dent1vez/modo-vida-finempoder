// src/db/lessonData.repository.ts
// Cross-lesson data persistence for Module 1 (and future modules).
// Lessons save user-entered data here so later lessons can pre-fill forms.

import { useAuth } from '../store/auth';
import { db } from './finempoderDb';

const currentUserId = () => useAuth.getState().user?.id ?? 'local';

export const lessonDataRepository = {
  async save(moduleId: string, key: string, data: unknown): Promise<void> {
    const userId = currentUserId();
    const existing = await db.userLessonData.where({ userId, moduleId, key }).first();
    const now = new Date().toISOString();
    if (existing) {
      await db.userLessonData.update(existing.id!, { data, updatedAt: now });
    } else {
      await db.userLessonData.add({ userId, moduleId, key, data, updatedAt: now });
    }
  },

  async load<T = unknown>(moduleId: string, key: string): Promise<T | null> {
    const userId = currentUserId();
    const row = await db.userLessonData.where({ userId, moduleId, key }).first();
    return row ? (row.data as T) : null;
  },
};
