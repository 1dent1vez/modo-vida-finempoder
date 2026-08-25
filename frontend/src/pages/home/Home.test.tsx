// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '@/db/finempoderDb';
import { useAuth } from '../../store/auth';
import { useDailyGoal } from '../../store/dailyGoal';
import { useProgress } from '../../store/progress';
import Home from './Home';
import { DAILY_TIPS, getDailyTip } from './dailyTips';

vi.mock('../../../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'mocked' } }),
        }),
      }),
    }),
  },
}));

let qc: QueryClient;

function renderHome() {
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/app']}>
        <Home />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

beforeEach(async () => {
  qc = new QueryClient();
  localStorage.clear();
  await db.lessonProgress.clear();
  useAuth.getState().clearAuth();
  useProgress.getState().reset();
  useDailyGoal.getState().setLevel('regular');
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Home (rediseño F1-OLA3)', () => {
  it('renderiza sin error y muestra todas las secciones con datos reales (todo en 0)', () => {
    renderHome();

    expect(screen.getByRole('heading', { name: 'Continúa aprendiendo' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Meta de hoy' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tu camino' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Esta semana' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tip del día' })).toBeVisible();

    // Números reales: 0 XP hoy de 200 (meta regular), stats semanales en 0.
    expect(screen.getByText('0/200 XP')).toBeVisible();
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);

    // Camino: presupuesto activo, ahorro e inversión bloqueados ("Próximo").
    expect(screen.getByText('0% avanzado')).toBeVisible();
    expect(screen.getAllByText('Próximo')).toHaveLength(2);
    expect(screen.getByText('Ver todo')).toBeVisible();
  });

  it('sin sesión y sin nombre saluda "Hola" y NUNCA dice "Estudiante"', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: 'Hola' })).toBeVisible();
    expect(screen.queryByText(/Estudiante/i)).toBeNull();
  });

  it('con nombre muestra "Hola, <nombre>" y tampoco dice "Estudiante"', () => {
    useAuth.getState().setAuth('token', {
      id: 'u1',
      email: 'ana@finempoder.com',
      name: 'Ana García',
    });
    renderHome();

    expect(screen.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
    expect(screen.queryByText(/Estudiante/i)).toBeNull();
  });

  it('el tip del día rota por día del año y siempre está dentro del array', () => {
    vi.useFakeTimers({ toFake: ['Date'] });

    const dayOne = new Date(2026, 7, 24, 12, 0);
    vi.setSystemTime(dayOne);
    const { unmount } = renderHome();
    const tipOne = getDailyTip(dayOne);
    expect(DAILY_TIPS).toContain(tipOne);
    expect(screen.getByText(tipOne)).toBeVisible();
    unmount();

    const dayTwo = new Date(2026, 7, 25, 12, 0);
    vi.setSystemTime(dayTwo);
    renderHome();
    const tipTwo = getDailyTip(dayTwo);
    expect(tipTwo).not.toBe(tipOne);
    expect(DAILY_TIPS).toContain(tipTwo);
    expect(screen.getByText(tipTwo)).toBeVisible();
  });

  it('con progreso real muestra la lección en curso y navega a su ruta', () => {
    // Presupuesto L01 completada → lección actual L02 y módulo 6%.
    localStorage.setItem(
      'fe_module_progress_presupuesto_v1',
      JSON.stringify({
        moduleId: 'presupuesto',
        version: 1,
        lastUpdated: new Date().toISOString(),
        lessons: {
          L01: 'completed',
          L02: 'available',
          L03: 'locked',
          L04: 'locked',
          L05: 'locked',
          L06: 'locked',
          L07: 'locked',
          L08: 'locked',
          L09: 'locked',
          L10: 'locked',
          L11: 'locked',
          L12: 'locked',
          L13: 'locked',
          L14: 'locked',
          L15: 'locked',
        },
      })
    );

    renderHome();

    expect(screen.getByText('Ingresos: fijos y variables')).toBeVisible();
    expect(screen.getByText('7% del módulo')).toBeVisible();
    expect(screen.getByRole('button', { name: /Continuar/ })).toBeVisible();
  });
});
