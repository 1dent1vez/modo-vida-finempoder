import { db } from '@/db/finempoderDb';
import { localDayKey } from '@/lib/localDate';

/**
 * XP por lección. lessonProgress (Dexie) NO guarda score: el repositorio solo
 * persiste completed/completedAt, así que se usa el default de 100 XP por
 * lección (mismo default del XP de LessonShell). Documentado en F1_OL2_CAMBIOS.md.
 */
export const XP_PER_LESSON = 100;

/**
 * XP del día DERIVADO de lessonProgress: suma de lecciones completadas hoy
 * (day key LOCAL) × XP_PER_LESSON. Sin estado duplicado en stores.
 */
export async function getTodayXp(userId?: string): Promise<number> {
  const uid = userId ?? 'local';
  const today = localDayKey(new Date());
  const rows = await db.lessonProgress
    .where('userId')
    .equals(uid)
    .filter(
      (row) =>
        row.completed === true &&
        !!row.completedAt &&
        localDayKey(new Date(row.completedAt)) === today
    )
    .toArray();
  return rows.length * XP_PER_LESSON;
}
