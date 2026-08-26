// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

vi.mock('@/lib/supabase', () => ({
  supabase: { rpc: vi.fn() },
}));

import { supabase } from '@/lib/supabase';
import { db } from '@/db/finempoderDb';
import { useAuth } from '@/store/auth';
import { useLeagues, type League } from '@/store/leagues';
import { useLeagueSync } from './leagueSync';

const rpcMock = vi.mocked(supabase.rpc);

const leagues: League[] = [
  { id: 'l1', name: 'Lecciones', invite_code: 'ABC234', owner_id: 'u1', metric: 'lessons', created_at: 'x' },
  { id: 'l2', name: 'XP', invite_code: 'ABC235', owner_id: 'u1', metric: 'xp', created_at: 'x' },
];

function Harness() {
  useLeagueSync();
  return null;
}

beforeEach(async () => {
  vi.clearAllMocks();
  await db.lessonProgress.clear();
  useAuth.setState({ token: null, user: null, hydrated: true });
  useLeagues.setState({ leagues: [], loaded: false });
});

afterEach(async () => {
  await db.lessonProgress.clear();
});

describe('useLeagueSync — listener fe:lesson-completed con debounce (~3s)', () => {
  it('en guest no escucha ni sincroniza', async () => {
    const view = render(<Harness />);
    window.dispatchEvent(new CustomEvent('fe:lesson-completed'));
    await new Promise((r) => setTimeout(r, 120));
    expect(rpcMock).not.toHaveBeenCalled();
    view.unmount();
  });

  it('con sesión, el evento dispara un solo sync agrupado tras el debounce', async () => {
    useAuth.setState({ token: 't', user: { id: 'u1', email: 'x@y.z' }, hydrated: true });
    useLeagues.setState({ leagues, loaded: true });
    rpcMock.mockResolvedValue({ error: null } as never);

    const view = render(<Harness />);

    // Tres lecciones completadas seguidas: el debounce agrupa en UN sync.
    window.dispatchEvent(new CustomEvent('fe:lesson-completed'));
    window.dispatchEvent(new CustomEvent('fe:lesson-completed'));
    window.dispatchEvent(new CustomEvent('fe:lesson-completed'));

    await waitFor(() => expect(rpcMock).toHaveBeenCalledTimes(leagues.length), {
      timeout: 6000,
    });
    // El ciclo usa el mismo weekStart para todas las ligas del usuario.
    const args = rpcMock.mock.calls.map(([, params]) => (params as { p_league_id: string }).p_league_id);
    expect(args).toEqual(leagues.map((l) => l.id));
    view.unmount();
  });
});
