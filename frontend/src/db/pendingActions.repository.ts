import { db, type PendingAction } from './finempoderDb';

export type LessonCompletedPayload = {
  moduleId: string;
  lessonId: string;
  completedAt: string;
};

const RESOURCE_LESSON_COMPLETED = '/progress/lesson-completed';

export const pendingActionsRepository = {
  async addLessonCompleted(userId: string, payload: LessonCompletedPayload) {
    const record: PendingAction = {
      userId,
      type: 'lessonCompleted',
      resource: RESOURCE_LESSON_COMPLETED,
      payload,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      lastTriedAt: undefined,
    };
    await db.pendingActions.add(record);
  },

  async listByUser(userId: string): Promise<PendingAction[]> {
    return db.pendingActions.where({ userId }).sortBy('createdAt');
  },

  async remove(id: number) {
    await db.pendingActions.delete(id);
  },

  isLessonCompletedAction(action: PendingAction): action is PendingAction & { payload: LessonCompletedPayload } {
    return action.type === 'lessonCompleted' && action.resource === RESOURCE_LESSON_COMPLETED;
  },
};

export const PENDING_RESOURCES = {
  lessonCompleted: RESOURCE_LESSON_COMPLETED,
};
