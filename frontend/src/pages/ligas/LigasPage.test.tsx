// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('@/lib/supabase', () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

import { supabase } from '@/lib/supabase';
import { db } from '@/db/finempoderDb';
import { useAuth } from '@/store/auth';
import { useLeagues, type League } from '@/store/leagues';
import { useNotifications } from '@/store/notifications';
import { isValidInviteCode } from '@/lib/leagueCode';
import { waMeUrl } from '@/lib/shareAchievement';
import LigasPage from './LigasPage';

const fromMock = vi.mocked(supabase.from);
const rpcMock = vi.mocked(supabase.rpc);

const LEAGUE: League = {
  id: 'l1',
  name: 'Ahorro con la banda',
  invite_code: 'ABC234',
  owner_id: 'u1',
  metric: 'lessons',
  created_at: '2026-08-01T00:00:00Z',
};

const RANKING = [
  { user_id: 'u9', name: 'Ana', metric_value: 5, pos: 1 },
  { user_id: 'u1', name: 'Tú', metric_value: 3, pos: 2 },
  { user_id: 'u8', name: '', metric_value: 2, pos: 3 },
  { user_id: 'u7', name: 'Pepe', metric_value: 1, pos: 4 },
];

function setupSupabase(opts: {
  memberRows?: Array<{ leagues: League | null }>;
  league?: League | null;
  /** true: .single() devuelve la liga con los datos del insert (flujo crear). */
  leagueFromInsert?: boolean;
  joinLeague?: string | null;
  ranking?: unknown[];
} = {}) {
  const membersBuilder = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: opts.memberRows ?? [], error: null }),
  };
  const leaguesBuilder = {
    insert: vi.fn().mockResolvedValue({ data: null, error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(async () => {
      if (opts.leagueFromInsert) {
        const arg = leaguesBuilder.insert.mock.calls[0][0] as Partial<League>;
        return {
          data: { ...LEAGUE, ...arg, invite_code: arg.invite_code ?? LEAGUE.invite_code },
          error: null,
        };
      }
      return { data: opts.league ?? null, error: null };
    }),
  };
  fromMock.mockImplementation(((table: string) =>
    table === 'league_members' ? membersBuilder : leaguesBuilder) as never);
  rpcMock.mockImplementation(((fn: string) => {
    if (fn === 'join_league') {
      return Promise.resolve({
        data: opts.joinLeague === undefined ? 'l1' : opts.joinLeague,
        error: null,
      });
    }
    if (fn === 'get_league_ranking') return Promise.resolve({ data: opts.ranking ?? [], error: null });
    if (fn === 'upsert_league_entry') return Promise.resolve({ error: null });
    return Promise.resolve({ data: null, error: null });
  }) as never);
  return { membersBuilder, leaguesBuilder };
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/app/ligas']}>
      <Routes>
        <Route path="/app/ligas" element={<LigasPage />} />
        <Route path="/auth" element={<div>pagina-auth</div>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(async () => {
  vi.clearAllMocks();
  useAuth.setState({ token: null, user: null, hydrated: true });
  useLeagues.getState().clear();
  useNotifications.setState({ queue: [] });
  await db.userLessonData.clear();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('LigasPage — guest', () => {
  it('sin sesión muestra la invitación y navega a /auth', () => {
    renderPage();
    expect(screen.getByText('Las ligas necesitan cuenta')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Entrar con tu correo' }));
    expect(screen.getByText('pagina-auth')).toBeTruthy();
    expect(fromMock).not.toHaveBeenCalled();
  });
});

describe('LigasPage — con sesión', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    useAuth.setState({ token: 't', user: { id: 'u1', email: 'a@b.c' }, hydrated: true });
  });

  it('sin ligas muestra el empty state con Crear liga y Unirme con código', async () => {
    setupSupabase();
    renderPage();
    expect(await screen.findByText('Aún no estás en una liga')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Crear liga' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Unirme con código' })).toBeTruthy();
  });

  it('crear liga: insert con código válido, éxito con código en grande y copiar', async () => {
    const { leaguesBuilder } = setupSupabase({ memberRows: [{ leagues: LEAGUE }], leagueFromInsert: true });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Crear liga' }));

    fireEvent.change(screen.getByLabelText('Nombre de la liga'), {
      target: { value: '  Mi liga de ahorro  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'XP' }));
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    // insert con el código generado (6 chars del alfabeto sin ambiguos)
    const insertArg = await vi.waitFor(() => {
      expect(leaguesBuilder.insert).toHaveBeenCalledTimes(1);
      return leaguesBuilder.insert.mock.calls[0][0] as {
        name: string;
        invite_code: string;
        owner_id: string;
        metric: string;
      };
    });
    expect(insertArg.name).toBe('Mi liga de ahorro');
    expect(insertArg.owner_id).toBe('u1');
    expect(insertArg.metric).toBe('xp');
    expect(isValidInviteCode(insertArg.invite_code)).toBe(true);

    // el dueño se inscribe vía el RPC join_league
    expect(rpcMock).toHaveBeenCalledWith('join_league', { p_invite_code: insertArg.invite_code });

    // pantalla de éxito: código EN GRANDE
    expect(await screen.findByText('Liga creada')).toBeTruthy();
    expect(screen.getByText(insertArg.invite_code)).toBeTruthy();

    // copiar: feedback "Copiado"
    fireEvent.click(screen.getByRole('button', { name: 'Copiar código' }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(insertArg.invite_code);
    expect(await screen.findByText('Copiado')).toBeTruthy();

    // compartir por WhatsApp con el copy exacto
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    fireEvent.click(screen.getByRole('button', { name: 'Compartir código' }));
    expect(openSpy).toHaveBeenCalledWith(
      waMeUrl(`Únete a mi liga en FinEMPODER con el código ${insertArg.invite_code}`),
      '_blank'
    );
  });

  it('nombre de liga inválido muestra error de validación sin llamar insert', async () => {
    const { leaguesBuilder } = setupSupabase();
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Crear liga' }));

    fireEvent.change(screen.getByLabelText('Nombre de la liga'), {
      target: { value: 'ab' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Crear' }));

    expect(await screen.findByText('El nombre debe tener entre 3 y 40 caracteres')).toBeTruthy();
    expect(leaguesBuilder.insert).not.toHaveBeenCalled();
  });

  it('unirme con código corto muestra "Ese código no es válido" sin llamar el RPC', async () => {
    setupSupabase();
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Unirme con código' }));

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'AB' } });
    fireEvent.click(screen.getByRole('button', { name: 'Unirme' }));

    expect(await screen.findByText('Ese código no es válido')).toBeTruthy();
    expect(rpcMock).not.toHaveBeenCalledWith('join_league', expect.anything());
  });

  it('unirme: RPC devuelve null (código inexistente) muestra "Ese código no es válido"', async () => {
    setupSupabase({ joinLeague: null });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Unirme con código' }));

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'ABC234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Unirme' }));

    expect(await screen.findByText('Ese código no es válido')).toBeTruthy();
  });

  it('unirme con éxito: refresca el store y muestra la liga con su ranking', async () => {
    setupSupabase({ memberRows: [{ leagues: LEAGUE }], joinLeague: 'l1', ranking: RANKING });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Unirme con código' }));

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'abc234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Unirme' }));

    await vi.waitFor(() => {
      expect(useNotifications.getState().queue.some((n) => n.message === 'Te uniste a la liga')).toBe(true);
    });

    // la liga queda visible y expandida con el ranking
    expect(await screen.findByText('Ahorro con la banda')).toBeTruthy();
    expect(await screen.findByText('1º')).toBeTruthy();
  });

  it('ranking semanal: posiciones con medalla, formato por métrica y fila del usuario resaltada', async () => {
    setupSupabase({ memberRows: [{ leagues: LEAGUE }], ranking: RANKING });
    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: 'Ver ranking' }));

    // posiciones 1º/2º/3º con medalla; resto solo número
    expect(await screen.findByText('1º')).toBeTruthy();
    expect(screen.getByText('2º')).toBeTruthy();
    expect(screen.getByText('3º')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();

    // nombre: trim o 'Usuario' si vacío; valor con formato de métrica
    expect(screen.getByText('Ana')).toBeTruthy();
    expect(screen.getByText('Usuario')).toBeTruthy();
    expect(screen.getByText('5 lecciones')).toBeTruthy();
    expect(screen.queryByText('2 días')).toBeNull(); // métrica es lessons

    // tu posición derivada del ranking
    expect(screen.getByText('Tu posición: 2º')).toBeTruthy();

    // fila del usuario resaltada
    const myRow = screen.getByTestId('ranking-row-u1');
    expect(myRow.className).toContain('color-brand-secondary');
  });
});
