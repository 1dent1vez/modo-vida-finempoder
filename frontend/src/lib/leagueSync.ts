// FinEmpoder — Sync semanal de ligas (F4-LIGAS).
// Por cada liga del usuario calcula la métrica de ESA liga (lecciones de la
// semana LUNES-DOMINGO local, XP = lecciones × XP_PER_LESSON, o racha actual)
// y la sube con upsert_league_entry. Un solo ciclo agrupado con el mismo
// weekStart para no spamear RPCs. Los fallos de red solo se loguean: el
// siguiente evento (o abrir la pestaña Ligas) reintenta de forma natural.
import { useEffect } from 'react';
import { db } from '@/db/finempoderDb';
import { supabase } from '@/lib/supabase';
import { addDaysLocal } from '@/lib/localDate';
import { XP_PER_LESSON } from '@/lib/dailyXp';
import { weekStartISO } from '@/lib/leagueCode';
import { useAuth } from '@/store/auth';
import { useLeagues, type League } from '@/store/leagues';
import { useProgress } from '@/store/progress';

/** 'YYYY-MM-DD' → medianoche LOCAL (nunca UTC). */
function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Lecciones completadas entre el lunes (inclusive) y el domingo de la semana.
 * A diferencia de getWeekStats (ventana móvil de 7 días), aquí la semana es
 * lunes-domingo en hora LOCAL, como define la liga.
 */
export async function getWeekLessons(userId: string, weekStart: string): Promise<number> {
  const start = parseLocalDate(weekStart);
  const end = addDaysLocal(start, 7);
  const rows = await db.lessonProgress
    .where('userId')
    .equals(userId)
    .filter((row) => {
      if (row.completed !== true || !row.completedAt) return false;
      const t = new Date(row.completedAt);
      return t >= start && t < end;
    })
    .toArray();
  return rows.length;
}

/** Métrica de la liga para la semana indicada (mismo patrón que weekStats). */
export async function computeLeagueMetric(
  league: League,
  userId: string,
  weekStart: string
): Promise<number> {
  switch (league.metric) {
    case 'lessons':
      return getWeekLessons(userId, weekStart);
    case 'xp':
      return (await getWeekLessons(userId, weekStart)) * XP_PER_LESSON;
    case 'streak':
      return useProgress.getState().streak.current ?? 0;
  }
}

/**
 * Sube el puntaje semanal de todas las ligas del usuario en un solo ciclo.
 * Guest (userId 'local') y lista vacía no hacen nada. Los errores de red NO
 * rompen el ciclo: se loguean y el siguiente disparador reintenta.
 */
export async function syncWeeklyProgress(userId: string, leagues: League[]): Promise<void> {
  if (!userId || userId === 'local' || leagues.length === 0) return;
  const weekStart = weekStartISO(new Date());
  for (const league of leagues) {
    try {
      const value = await computeLeagueMetric(league, userId, weekStart);
      const { error } = await supabase.rpc('upsert_league_entry', {
        p_league_id: league.id,
        p_week_start: weekStart,
        p_metric_value: value,
      });
      if (error) {
        console.error('[ligas] fallo al sincronizar', league.id, error);
      }
    } catch (err) {
      console.error('[ligas] fallo al sincronizar', league.id, err);
    }
  }
}

export const SYNC_DEBOUNCE_MS = 3000;

/**
 * Escucha 'fe:lesson-completed' (emitido por LessonShell) y sincroniza las
 * ligas del usuario con debounce ~3s. SIN sync en guest. Se monta en
 * PrivateRoute para estar vivo en toda la app; las ligas se leen del store
 * (la pestaña Ligas las carga al abrirse).
 */
export function useLeagueSync() {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);

  useEffect(() => {
    if (!token || !userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const onLessonCompleted = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void syncWeeklyProgress(userId, useLeagues.getState().leagues);
      }, SYNC_DEBOUNCE_MS);
    };
    window.addEventListener('fe:lesson-completed', onLessonCompleted);
    return () => {
      window.removeEventListener('fe:lesson-completed', onLessonCompleted);
      if (timer) clearTimeout(timer);
    };
  }, [token, userId]);
}
