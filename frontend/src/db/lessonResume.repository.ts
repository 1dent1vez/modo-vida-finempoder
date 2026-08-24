// src/db/lessonResume.repository.ts
// Snapshot del avance intra-lección (autoguardado). Vive en userLessonData
// bajo la key 'resume:v1:<lessonId>' y NO toca el progreso real (lessonProgress).

import { useAuth } from '../store/auth';
import { db } from './finempoderDb';

export type LessonResumeState = {
  step: number;
  payload?: unknown;
};

export const RESUME_KEY_PREFIX = 'resume:v1';

const currentUserId = () => useAuth.getState().user?.id ?? 'local';

const resumeKey = (lessonId: string) => `${RESUME_KEY_PREFIX}:${lessonId}`;

export const lessonResumeRepository = {
  async save(moduleId: string, lessonId: string, state: LessonResumeState): Promise<void> {
    const userId = currentUserId();
    const key = resumeKey(lessonId);
    const existing = await db.userLessonData.where({ userId, moduleId, key }).first();
    const now = new Date().toISOString();
    if (existing) {
      await db.userLessonData.update(existing.id!, { data: state, updatedAt: now });
    } else {
      await db.userLessonData.add({ userId, moduleId, key, data: state, updatedAt: now });
    }
  },

  async get(moduleId: string, lessonId: string): Promise<LessonResumeState | null> {
    const userId = currentUserId();
    const row = await db.userLessonData.where({ userId, moduleId, key: resumeKey(lessonId) }).first();
    return row ? (row.data as LessonResumeState) : null;
  },

  async clear(moduleId: string, lessonId: string): Promise<void> {
    const userId = currentUserId();
    await db.userLessonData.where({ userId, moduleId, key: resumeKey(lessonId) }).delete();
  },
};
