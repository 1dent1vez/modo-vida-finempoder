// src/db/lessonData.repository.ts
// Cross-lesson data persistence for Module 1 (and future modules).
// Lessons save user-entered data here so later lessons can pre-fill forms.

import { useAuth } from '../store/auth';
import { db } from './finempoderDb';

const currentUserId = () => useAuth.getState().user?.id ?? 'local';

export const lessonDataRepository = {
  async save(moduleId: string, key: string, data: unknown): Promise<void> {
    const userId = currentUserId();
    await db.transaction('rw', db.userLessonData, async () => {
      const existing = await db.userLessonData
        .where('[userId+moduleId+key]')
        .equals([userId, moduleId, key])
        .first();
      const row = { userId, moduleId, key, data, updatedAt: new Date().toISOString() };
      await db.userLessonData.put(existing?.id ? { ...row, id: existing.id } : row);
    });
  },

  async saveBatch(
    moduleId: string,
    entries: ReadonlyArray<{ key: string; data: unknown }>,
  ): Promise<void> {
    const userId = currentUserId();
    await db.transaction('rw', db.userLessonData, async () => {
      for (const { key, data } of entries) {
        const existing = await db.userLessonData
          .where('[userId+moduleId+key]')
          .equals([userId, moduleId, key])
          .first();
        const row = { userId, moduleId, key, data, updatedAt: new Date().toISOString() };
        await db.userLessonData.put(existing?.id ? { ...row, id: existing.id } : row);
      }
    });
  },

  async load<T = unknown>(moduleId: string, key: string): Promise<T | null> {
    const userId = currentUserId();
    const row = await db.userLessonData
      .where('[userId+moduleId+key]')
      .equals([userId, moduleId, key])
      .first();
    return row ? (row.data as T) : null;
  },
};
