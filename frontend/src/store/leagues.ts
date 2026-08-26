// FinEmpoder — Store de ligas del usuario (F4-LIGAS).
// Patrón zustand del repo: estado + load/refresh/clear. El fetch lee las
// ligas vía league_members (con las políticas RLS del lado servidor) y la
// lista se cachea en Dexie (userLessonData, key 'leagues:v1') para mostrarla
// offline: si la red falla y hay caché, se muestra la caché.
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { db } from '@/db/finempoderDb';
import { useAuth } from './auth';

export type LeagueMetric = 'lessons' | 'xp' | 'streak';

export type League = {
  id: string;
  name: string;
  invite_code: string;
  owner_id: string;
  metric: LeagueMetric;
  created_at: string;
};

const CACHE_MODULE = 'ligas';
const CACHE_KEY = 'leagues:v1';

async function readCachedLeagues(userId: string): Promise<League[] | null> {
  const row = await db.userLessonData
    .where({ userId, moduleId: CACHE_MODULE, key: CACHE_KEY })
    .first();
  return row ? (row.data as League[]) : null;
}

async function writeCachedLeagues(userId: string, leagues: League[]): Promise<void> {
  const now = new Date().toISOString();
  const existing = await db.userLessonData
    .where({ userId, moduleId: CACHE_MODULE, key: CACHE_KEY })
    .first();
  if (existing) {
    await db.userLessonData.update(existing.id!, { data: leagues, updatedAt: now });
  } else {
    await db.userLessonData.add({
      userId,
      moduleId: CACHE_MODULE,
      key: CACHE_KEY,
      data: leagues,
      updatedAt: now,
    });
  }
}

type State = {
  leagues: League[];
  loading: boolean;
  /** true tras el primer load (éxito o caché): evita refetches duplicados. */
  loaded: boolean;
  error: string | null;
  load: (userId: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
};

export const useLeagues = create<State>()((set, get) => ({
  leagues: [],
  loading: false,
  loaded: false,
  error: null,

  load: async (userId) => {
    if (!userId || userId === 'local') {
      set({ leagues: [], loading: false, loaded: true, error: null });
      return;
    }
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('league_members')
        .select('leagues(*)')
        .eq('user_id', userId);
      if (error) throw error;
      const leagues = ((data ?? []) as unknown as Array<{ leagues: League | null }>)
        .map((row) => row.leagues)
        .filter((league): league is League => !!league && typeof league === 'object');
      await writeCachedLeagues(userId, leagues);
      set({ leagues, loading: false, loaded: true });
    } catch {
      // Fallo de red: si hay caché Dexie se muestra; si no, error suave.
      const cached = await readCachedLeagues(userId);
      if (cached) {
        set({ leagues: cached, loading: false, loaded: true });
      } else {
        set({ loading: false, loaded: true, error: 'No pudimos cargar tus ligas. Revisa tu conexión.' });
      }
    }
  },

  refresh: async () => {
    const userId = useAuth.getState().user?.id;
    if (userId) await get().load(userId);
  },

  clear: () => set({ leagues: [], loading: false, loaded: false, error: null }),
}));
