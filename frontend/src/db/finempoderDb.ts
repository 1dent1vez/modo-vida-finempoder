// src/db/finempoderDb.ts
//import Dexie, { Table } from 'dexie';
import Dexie, { type Table } from 'dexie';
// TIPOS EXPORTADOS
export interface LessonProgress {
  id?: number;
  userId: string;         // usuario dueño del progreso
  moduleId: string;       // 'presupuesto' | 'ahorro' | 'inversion' | etc.
  lessonId: string;       // 'L01', 'L02', ...
  completed: boolean;
  completedAt?: string;   // ISO string
}

export interface Streak {
  id?: number;
  date: string;           // 'YYYY-MM-DD'
  count: number;
}

export interface UserLessonData {
  id?: number;
  userId: string;
  moduleId: string;
  key: string;
  data: unknown;
  updatedAt: string;
}

export interface PendingAction {
  id?: number;
  userId: string;
  type: string;           // e.g. 'lessonCompleted'
  resource: string;       // e.g. '/api/progress/lesson-completed'
  payload: unknown;
  createdAt: string;      // ISO
  retryCount?: number;
  lastTriedAt?: string;   // ISO
}

// BASE DE DATOS DEXIE
export class FinempoderDB extends Dexie {
  lessonProgress!: Table<LessonProgress, number>;
  streaks!: Table<Streak, number>;
  pendingActions!: Table<PendingAction, number>;
  userLessonData!: Table<UserLessonData, number>;

  constructor() {
    super('FinempoderDB');

    // v1 inicial: moduleId + lessonId
    this.version(1).stores({
      lessonProgress: '++id, moduleId, lessonId, completed',
      streaks: '++id, date',
      pendingActions: '++id, type, resource'
    });

    // v2: aislamos progreso por usuario y agregamos índices
    this.version(2)
      .stores({
        lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
        streaks: '++id, date',
        pendingActions: '++id, type, resource'
      })
      .upgrade(async (tx) => {
        const table = tx.table<LessonProgress, number>('lessonProgress');
        await table.toCollection().modify((row) => {
          if (!(row as LessonProgress).userId) {
            (row as LessonProgress).userId = 'local';
          }
        });
      });

    // v3: pendingActions por usuario
    this.version(3)
      .stores({
        lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
        streaks: '++id, date',
        pendingActions: '++id, userId, type, resource, createdAt'
      })
      .upgrade(async (tx) => {
        const table = tx.table<PendingAction, number>('pendingActions');
        await table.toCollection().modify((row) => {
          if (!(row as PendingAction).userId) {
            (row as PendingAction).userId = 'local';
          }
        });
      });

    // v4: backoff metadata for pendingActions
    this.version(4)
      .stores({
        lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
        streaks: '++id, date',
        pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt'
      })
      .upgrade(async (tx) => {
        const table = tx.table<PendingAction, number>('pendingActions');
        await table.toCollection().modify((row) => {
          if ((row as PendingAction).retryCount === undefined) {
            (row as PendingAction).retryCount = 0;
          }
          if (!(row as PendingAction).lastTriedAt) {
            (row as PendingAction).lastTriedAt = undefined;
          }
        });
      });

    // v5: userLessonData for cross-lesson persistence
    this.version(5).stores({
      lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
      streaks: '++id, date',
      pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt',
      userLessonData: '++id, userId, moduleId, key',
    });
  }
}

// INSTANCIA ÚNICA
export const db = new FinempoderDB();
