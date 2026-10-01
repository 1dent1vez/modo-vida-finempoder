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

// Timers pendientes del autoguardado (debounce), compartidos por el repo con
// key única `${userId}|${moduleId}|${lessonId}`. Así clear() puede cancelar
// cualquier save pendiente (aunque lo haya agendado el hook) y la carrera
// debounce-vs-clear del LessonShell queda cerrada en el repositorio.
const pendingTimers = new Map<string, ReturnType<typeof setTimeout>>();

const pendingTimerKey = (userId: string, moduleId: string, lessonId: string) =>
  `${userId}|${moduleId}|${lessonId}`;

const registerPendingTimer = (key: string, timerId: ReturnType<typeof setTimeout>) => {
  const previous = pendingTimers.get(key);
  if (previous !== undefined) {
    clearTimeout(previous);
  }
  pendingTimers.set(key, timerId);
};

const clearPendingTimer = (key: string) => {
  const timerId = pendingTimers.get(key);
  if (timerId !== undefined) {
    clearTimeout(timerId);
    pendingTimers.delete(key);
  }
};

const saveSnapshot = async (
  userId: string,
  moduleId: string,
  lessonId: string,
  state: LessonResumeState
): Promise<void> => {
  const key = resumeKey(lessonId);
  const existing = await db.userLessonData.where({ userId, moduleId, key }).first();
  const now = new Date().toISOString();
  if (existing) {
    await db.userLessonData.update(existing.id!, { data: state, updatedAt: now });
  } else {
    await db.userLessonData.add({ userId, moduleId, key, data: state, updatedAt: now });
  }
};

export const lessonResumeRepository = {
  async save(moduleId: string, lessonId: string, state: LessonResumeState): Promise<void> {
    await saveSnapshot(currentUserId(), moduleId, lessonId, state);
  },

  async get(moduleId: string, lessonId: string): Promise<LessonResumeState | null> {
    const userId = currentUserId();
    const row = await db.userLessonData.where({ userId, moduleId, key: resumeKey(lessonId) }).first();
    return row ? (row.data as LessonResumeState) : null;
  },

  async clear(moduleId: string, lessonId: string): Promise<void> {
    const userId = currentUserId();
    // Invalida el save pendiente (debounce) antes de borrar la fila: cualquier
    // timer registrado para esta key se cancela, no re-escribe el snapshot.
    clearPendingTimer(pendingTimerKey(userId, moduleId, lessonId));
    await db.userLessonData.where({ userId, moduleId, key: resumeKey(lessonId) }).delete();
  },

  scheduleSave(
    moduleId: string,
    lessonId: string,
    state: LessonResumeState,
    debounceMs = 500
  ): void {
    const userId = currentUserId();
    const key = pendingTimerKey(userId, moduleId, lessonId);
    registerPendingTimer(
      key,
      setTimeout(() => {
        pendingTimers.delete(key);
        void saveSnapshot(userId, moduleId, lessonId, state);
      }, debounceMs)
    );
  },

  cancelPendingSave(moduleId: string, lessonId: string): void {
    clearPendingTimer(pendingTimerKey(currentUserId(), moduleId, lessonId));
  },
};
