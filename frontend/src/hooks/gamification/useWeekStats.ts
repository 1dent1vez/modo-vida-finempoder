import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { getWeekStats, type WeekStats } from '@/lib/weekStats';

const EMPTY: WeekStats = { completed: 0, xp: 0 };

/** Estadísticas de la semana (ventana 7 días) derivadas de lessonProgress. */
export function useWeekStats() {
  const userId = useAuth((s) => s.user?.id);
  const [stats, setStats] = useState<WeekStats>(EMPTY);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = await getWeekStats(userId ?? 'local');
      if (!cancelled) {
        setStats(next);
        setLoaded(true);
      }
    };
    void load();

    const onFocus = () => {
      void load();
    };
    window.addEventListener('focus', onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [userId]);

  return { stats, loaded };
}
