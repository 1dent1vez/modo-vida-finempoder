import { db } from '@/db/finempoderDb';
import { addDaysLocal } from '@/lib/localDate';
import { XP_PER_LESSON } from '@/lib/dailyXp';

export type WeekStats = {
  /** Lecciones completadas en la ventana de 7 días. */
  completed: number;
  /** XP ganados en la misma ventana (100 XP por lección, mismo default que XP_PER_LESSON). */
  xp: number;
};

/**
 * Estadísticas de "Esta semana": ventana móvil de 7 días (hoy + 6 anteriores),
 * derivadas de lessonProgress (Dexie) con completedAt — el único dato real
 * disponible por lección. Documentado en F1_OL3_CAMBIOS.md.
 */
export async function getWeekStats(userId?: string): Promise<WeekStats> {
  const uid = userId ?? 'local';
  const start = addDaysLocal(new Date(), -6);
  start.setHours(0, 0, 0, 0);

  const rows = await db.lessonProgress
    .where('userId')
    .equals(uid)
    .filter(
      (row) =>
        row.completed === true &&
        !!row.completedAt &&
        new Date(row.completedAt) >= start
    )
    .toArray();

  return { completed: rows.length, xp: rows.length * XP_PER_LESSON };
}
