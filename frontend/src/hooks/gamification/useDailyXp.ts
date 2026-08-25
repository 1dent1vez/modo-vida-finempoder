import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import { getTodayXp } from '@/lib/dailyXp';

/** XP del día (derivado de lessonProgress). Se recalcula al montar y al recuperar foco. */
export function useDailyXp() {
  const userId = useAuth((s) => s.user?.id);
  const [xpToday, setXpToday] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const xp = await getTodayXp(userId ?? 'local');
      if (!cancelled) {
        setXpToday(xp);
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

  return { xpToday, loaded };
}
