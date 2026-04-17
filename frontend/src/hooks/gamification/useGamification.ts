import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import gamificationApi, { type GamificationResponse } from '../../api/gamification/gamification.api';
import { useAuth } from '../../store/auth';
import { useProgress } from '../../store/progress';

export function useGamification() {
  const token = useAuth((s) => s.token);
  const hydrateStreak = useProgress((s) => s.hydrateStreak);

  const query = useQuery<GamificationResponse, Error>({
    queryKey: ['gamification', 'me'],
    queryFn: () => gamificationApi.me(),
    enabled: !!token,
    staleTime: 1000 * 60, // 1 minuto
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
