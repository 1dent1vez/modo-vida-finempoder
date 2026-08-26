// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn() },
}));

import { supabase } from '@/lib/supabase';
import { db } from '@/db/finempoderDb';
import { useAuth } from './auth';
import { useLeagues, type League } from './leagues';

const fromMock = vi.mocked(supabase.from);

function mockMembersQuery(data: unknown, error: Error | null = null) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  // Terminal de la cadena: .eq(...) es lo que se await-a.
  builder.eq.mockResolvedValue({ data, error });
  fromMock.mockReturnValue(builder as never);
  return builder;
}

const LEAGUE_ROW: League = {
  id: 'l1',
  name: 'Ahorro juntos',
  invite_code: 'ABC234',
  owner_id: 'u1',
  metric: 'lessons',
  created_at: '2026-08-01T00:00:00Z',
};

beforeEach(async () => {
  vi.clearAllMocks();
  useLeagues.getState().clear();
  useAuth.setState({ token: null, user: null, hydrated: true });
  await db.userLessonData.clear();
});

afterEach(async () => {
  await db.userLessonData.clear();
});

describe('useLeagues — load/refresh/clear con caché Dexie', () => {
  it('load guarda las ligas y las cachea en userLessonData (key leagues:v1)', async () => {
    const builder = mockMembersQuery([{ leagues: LEAGUE_ROW }]);

    await useLeagues.getState().load('u1');

    expect(builder.select).toHaveBeenCalledWith('leagues(*)');
    expect(builder.eq).toHaveBeenCalledWith('user_id', 'u1');
    expect(useLeagues.getState().leagues).toEqual([LEAGUE_ROW]);
    expect(useLeagues.getState().loaded).toBe(true);
    expect(useLeagues.getState().error).toBeNull();

    const cached = await db.userLessonData
      .where({ userId: 'u1', moduleId: 'ligas', key: 'leagues:v1' })
      .first();
    expect(cached?.data).toEqual([LEAGUE_ROW]);
  });

  it('descarta filas sin leagues y no falla con lista vacía', async () => {
    mockMembersQuery([{ leagues: null }, { leagues: LEAGUE_ROW }]);
    await useLeagues.getState().load('u1');
    expect(useLeagues.getState().leagues).toEqual([LEAGUE_ROW]);
  });

  it('error de red usa la caché Dexie si existe', async () => {
    await db.userLessonData.add({
      userId: 'u1',
      moduleId: 'ligas',
      key: 'leagues:v1',
      data: [LEAGUE_ROW],
      updatedAt: '2026-08-01T00:00:00Z',
    });
    mockMembersQuery(null, new Error('red caída'));

    await useLeagues.getState().load('u1');

    expect(useLeagues.getState().leagues).toEqual([LEAGUE_ROW]);
    expect(useLeagues.getState().error).toBeNull();
    expect(useLeagues.getState().loading).toBe(false);
  });

  it('error de red sin caché deja error suave y lista vacía', async () => {
    mockMembersQuery(null, new Error('red caída'));
    await useLeagues.getState().load('u1');
    expect(useLeagues.getState().leagues).toEqual([]);
    expect(useLeagues.getState().error).toContain('No pudimos cargar tus ligas');
  });

  it('guest (userId local) no consulta supabase', async () => {
    await useLeagues.getState().load('local');
    expect(fromMock).not.toHaveBeenCalled();
    expect(useLeagues.getState().leagues).toEqual([]);
  });

  it('refresh usa el usuario de la sesión auth', async () => {
    useAuth.setState({ token: 't', user: { id: 'u2', email: 'x@y.z' }, hydrated: true });
    const builder = mockMembersQuery([{ leagues: LEAGUE_ROW }]);

    await useLeagues.getState().refresh();

    expect(builder.eq).toHaveBeenCalledWith('user_id', 'u2');
    expect(useLeagues.getState().leagues).toEqual([LEAGUE_ROW]);
  });

  it('clear resetea el estado', async () => {
    mockMembersQuery([{ leagues: LEAGUE_ROW }]);
    await useLeagues.getState().load('u1');
    expect(useLeagues.getState().leagues).toHaveLength(1);

    useLeagues.getState().clear();
    expect(useLeagues.getState().leagues).toEqual([]);
    expect(useLeagues.getState().loaded).toBe(false);
    expect(useLeagues.getState().error).toBeNull();
  });
});
