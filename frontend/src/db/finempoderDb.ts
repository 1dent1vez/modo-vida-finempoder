// src/db/finempoderDb.ts
//import Dexie, { Table } from 'dexie';
import Dexie, { type Table } from 'dexie';
// TIPOS EXPORTADOS
export interface LessonProgress {
  id?: number;
  userId: string; // usuario dueño del progreso
  moduleId: string; // 'presupuesto' | 'ahorro' | 'inversion' | etc.
  lessonId: string; // 'L01', 'L02', ...
  completed: boolean;
  completedAt?: string; // ISO string
}

export interface Streak {
  id?: number;
  date: string; // 'YYYY-MM-DD'
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
  type: string; // e.g. 'lessonCompleted'
  resource: string; // e.g. '/api/progress/lesson-completed'
  payload: unknown;
  createdAt: string; // ISO
  retryCount?: number;
  lastTriedAt?: string; // ISO
}

export type SyncType = 'lesson_progress' | 'xp_update' | 'streak_update';

export interface SyncQueueItem {
  id?: number;
  userId: string;
  type: SyncType;
  payload: Record<string, unknown>;
  createdAt: string; // ISO
  retries: number;
  status: 'pending' | 'failed';
  lastTriedAt?: string; // ISO
}

export interface NewsletterSubscription {
  id?: number;
  email: string;
  source: string; // 'app' por ahora; futuras fuentes pueden llegar
  createdAt: string; // ISO
  synced: boolean; // false hasta que exista backend de newsletter
}

// BASE DE DATOS DEXIE
export class FinempoderDB extends Dexie {
  lessonProgress!: Table<LessonProgress, number>;
  streaks!: Table<Streak, number>;
  pendingActions!: Table<PendingAction, number>;
  userLessonData!: Table<UserLessonData, number>;
  syncQueue!: Table<SyncQueueItem, number>;
  newsletterSubscriptions!: Table<NewsletterSubscription, number>;

  constructor() {
    super('FinempoderDB');

    // v1 inicial: moduleId + lessonId
    this.version(1).stores({
      lessonProgress: '++id, moduleId, lessonId, completed',
      streaks: '++id, date',
      pendingActions: '++id, type, resource',
    });

    // v2: aislamos progreso por usuario y agregamos índices
    this.version(2)
      .stores({
        lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
        streaks: '++id, date',
        pendingActions: '++id, type, resource',
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
        pendingActions: '++id, userId, type, resource, createdAt',
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
        pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt',
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

    // v6: syncQueue — formal singleton-managed sync queue
    this.version(6).stores({
      lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
      streaks: '++id, date',
      pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt',
      userLessonData: '++id, userId, moduleId, key',
      syncQueue: '++id, userId, type, status, createdAt',
    });

    // v7 (F3-CRECIMIENTO): captura local de email para newsletter. Aditiva:
    // conserva todas las tablas v6 con la misma definición + la nueva.
    this.version(7).stores({
      lessonProgress: '++id, userId, moduleId, lessonId, completed, completedAt',
      streaks: '++id, date',
      pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt',
      userLessonData: '++id, userId, moduleId, key',
      syncQueue: '++id, userId, type, status, createdAt',
      newsletterSubscriptions: '++id, email, source, createdAt, synced',
    });

    // v8: prepara claves compuestas y elimina duplicados históricos antes de
    // volverlas únicas. Conserva siempre el registro actualizado más reciente.
    this.version(8)
      .stores({
        lessonProgress:
          '++id, [userId+moduleId+lessonId], userId, moduleId, lessonId, completed, completedAt',
        streaks: '++id, date',
        pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt',
        userLessonData: '++id, [userId+moduleId+key], userId, moduleId, key',
        syncQueue: '++id, userId, type, status, createdAt',
        newsletterSubscriptions: '++id, email, source, createdAt, synced',
      })
      .upgrade(async (tx) => {
        const lessonData = tx.table<UserLessonData, number>('userLessonData');
        const lessonRows = await lessonData.toArray();
        const latestData = new Map<string, UserLessonData>();
        for (const row of lessonRows) {
          const key = `${row.userId}\u0000${row.moduleId}\u0000${row.key}`;
          const current = latestData.get(key);
          if (!current || row.updatedAt >= current.updatedAt) latestData.set(key, row);
        }
        const retainedDataIds = new Set([...latestData.values()].map((row) => row.id));
        await lessonData.bulkDelete(
          lessonRows.flatMap((row) => (row.id && !retainedDataIds.has(row.id) ? [row.id] : [])),
        );

        const progress = tx.table<LessonProgress, number>('lessonProgress');
        const progressRows = await progress.toArray();
        const latestProgress = new Map<string, LessonProgress>();
        for (const row of progressRows) {
          const key = `${row.userId}\u0000${row.moduleId}\u0000${row.lessonId}`;
          const current = latestProgress.get(key);
          if (!current || (row.completedAt ?? '') >= (current.completedAt ?? '')) {
            latestProgress.set(key, row);
          }
        }
        const retainedProgressIds = new Set([...latestProgress.values()].map((row) => row.id));
        await progress.bulkDelete(
          progressRows.flatMap((row) =>
            row.id && !retainedProgressIds.has(row.id) ? [row.id] : [],
          ),
        );
      });

    // v9: la base de datos garantiza una sola fila lógica por lección y usuario.
    this.version(9).stores({
      lessonProgress:
        '++id, [userId+moduleId+lessonId], userId, moduleId, lessonId, completed, completedAt',
      streaks: '++id, date',
      pendingActions: '++id, userId, type, resource, createdAt, retryCount, lastTriedAt',
      userLessonData: '++id, &[userId+moduleId+key], userId, moduleId, key',
      syncQueue: '++id, userId, type, status, createdAt',
      newsletterSubscriptions: '++id, email, source, createdAt, synced',
    });
  }
}

// INSTANCIA ÚNICA
export const db = new FinempoderDB();
