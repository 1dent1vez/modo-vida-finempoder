import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';
import { useProgress } from '../../store/progress';

export type GamificationData = {
  xp: number;
  level: number;
  streak: { current: number; best: number; lastActiveISO?: string };
  modules?: Record<string, number>;
  updatedAt?: string;
};

const DEFAULTS: GamificationData = {
  xp: 0,
  level: 1,
  streak: { current: 0, best: 0, lastActiveISO: undefined },
  modules: {},
};

export function useGamification() {
  const token = useAuth((s) => s.token);
  const userId = useAuth((s) => s.user?.id);
  const hydrateStreak = useProgress((s) => s.hydrateStreak);

  const query = useQuery<GamificationData, Error>({
    queryKey: ['gamification', 'me', userId],
    queryFn: async () => {
      if (!userId) return DEFAULTS;
      const { data, error } = await supabase
        .from('gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) return DEFAULTS;

      return {
        xp: data.xp,
        level: data.level,
        streak: {
          current: data.streak_current,
          best: data.streak_best,
          lastActiveISO: data.last_active_iso ?? undefined,
        },
        modules: data.module_progress ?? {},
        updatedAt: data.updated_at,
      };
    },
    enabled: !!token && !!userId,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    if (query.data?.streak) {
      hydrateStreak({
        current: query.data.streak.current,
        best: query.data.streak.best,
        lastActiveISO: query.data.streak.lastActiveISO,
      });
    }
  }, [query.data, hydrateStreak]);

  return query;
}
