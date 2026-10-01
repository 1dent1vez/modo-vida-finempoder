// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
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

/** Patrón de emojis (incluye pictogramas extendidos, flags, tonos de piel,
 *  ZWJ y variación): la réplica del mockup usa SOLO iconos lucide. */
const EMOJI_RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

const EXPECTED_SECTION_ORDER = [
  'home-header',
  'section-meta',
  'section-continue',
  'section-path',
  'section-modules',
  'section-stats',
  'section-tip',
];

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

function renderHomeWithRoutes() {
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route path="/app" element={<Home />} />
          <Route
            path="/app/presupuesto/lesson/:lessonId"
            element={<div>LESSON-PAGE</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function seedPresupuestoProgress(completedIds: string[]) {
  const lessons = Object.fromEntries(
    [
      'L01',
      'L02',
      'L03',
      'L04',
      'L05',
      'L06',
      'L07',
      'L08',
      'L09',
      'L10',
      'L11',
      'L12',
      'L13',
      'L14',
      'L15',
    ].map((id) => [id, completedIds.includes(id) ? 'completed' : 'locked'])
  );
  const firstAvailable = completedIds.length;
  if (firstAvailable < 15) {
    lessons[`L${String(firstAvailable + 1).padStart(2, '0')}`] = 'available';
  }
  localStorage.setItem(
    'fe_module_progress_presupuesto_v1',
    JSON.stringify({
      moduleId: 'presupuesto',
      version: 1,
      lastUpdated: new Date().toISOString(),
      lessons,
    })
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

describe('Home (réplica mockup F1-HOME-MOCKUP-V2)', () => {
  it('renderiza sin error con todo en 0 y las secciones en el ORDEN del mockup', () => {
    const { container } = renderHome();

    // Estructura: header → meta diaria → continúa aprendiendo → tu camino →
    // tus módulos → estadísticas → tip del día (orden estricto del mockup).
    const sectionIds = Array.from(
      container.querySelectorAll('[data-testid^="home-header"],[data-testid^="section-"]')
    ).map((el) => el.getAttribute('data-testid'));
    expect(sectionIds).toEqual(EXPECTED_SECTION_ORDER);

    // Títulos y literales clave del mockup.
    expect(screen.getByText('Meta Regular · 200 XP')).toBeVisible();
    expect(screen.getByText('0/200 XP hoy')).toBeVisible();
    expect(screen.getByText(/PRESUPUESTACIÓN · 0% COMPLETADO/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /Ir ahora/ })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tu camino' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tus módulos' })).toBeVisible();
    expect(screen.getByText('Organiza ingresos y gastos')).toBeVisible();
    expect(screen.getByText('Crea hábitos de ahorro')).toBeVisible();
    expect(screen.getByText('Haz crecer tu dinero')).toBeVisible();
    expect(screen.getAllByText('0% completado')).toHaveLength(3);
    expect(screen.getAllByText('Ir')).toHaveLength(3);
    expect(screen.getByText('Lecciones')).toBeVisible();
    expect(screen.getByText('Racha')).toBeVisible();
    expect(screen.getByText('XP')).toBeVisible();
    expect(screen.getByText('0d')).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Tip del día' })).toBeVisible();
  });

  it('sin sesión y sin nombre saluda "Hola" y NUNCA dice "Estudiante"', () => {
    renderHome();
    expect(screen.getByRole('heading', { name: 'Hola' })).toBeVisible();
    expect(screen.queryByText(/Estudiante/i)).toBeNull();
  });

  it('con nombre muestra "Hola, <nombre>", la inicial en el avatar y tampoco dice "Estudiante"', () => {
    useAuth.getState().setAuth('token', {
      id: 'u1',
      email: 'ana@finempoder.com',
      name: 'Ana García',
    });
    renderHome();

    expect(screen.getByRole('heading', { name: 'Hola, Ana' })).toBeVisible();
    expect(screen.getByText('A')).toBeVisible();
    expect(screen.queryByText(/Estudiante/i)).toBeNull();
  });

  it('la fecha se capitaliza por palabra igual que el mockup ("Martes, 25 De Agosto")', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 7, 25, 12, 0));
    renderHome();
    expect(screen.getByText('Martes, 25 De Agosto')).toBeVisible();
  });

  it('el tip del día rota por día del año y siempre está dentro del array real', () => {
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

  it('CERO emojis en el render completo (iconos lucide, textos del mockup)', () => {
    const { container, rerender } = renderHome();

    const scan = () => {
      const text = container.textContent ?? '';
      expect(text).not.toMatch(EMOJI_RE);
    };
    scan();

    // Con nombre y progreso tampoco deben aparecer emojis.
    useAuth.getState().setAuth('token', {
      id: 'u1',
      email: 'ana@finempoder.com',
      name: 'Ana García',
    });
    seedPresupuestoProgress(['L01']);
    rerender(
      <QueryClientProvider client={qc}>
        <MemoryRouter initialEntries={['/app']}>
          <Home />
        </MemoryRouter>
      </QueryClientProvider>
    );
    scan();
  });

  it('con progreso real muestra la lección en curso, el % del módulo y navega a la lección', () => {
    seedPresupuestoProgress(['L01']);

    renderHomeWithRoutes();

    expect(screen.getByText('Ingresos: fijos y variables')).toBeVisible();
    expect(screen.getByText(/PRESUPUESTACIÓN · 7% COMPLETADO/i)).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Ir ahora/ }));
    expect(screen.getByText('LESSON-PAGE')).toBeVisible();
  });

  it('tu camino: nodo actual numerado, bloqueados con candado gris y admin sin candados', () => {
    const { container, unmount } = renderHome();

    // Sin progreso: presupuesto activo (nodo 1), ahorro e inversión bloqueados.
    expect(screen.getByText('1')).toBeVisible();
    expect(container.querySelectorAll('svg.lucide-lock')).toHaveLength(2);

    unmount();
    localStorage.setItem('fe_admin_mode', '1');
    const adminRender = renderHome();
    expect(adminRender.container.querySelectorAll('svg.lucide-lock')).toHaveLength(0);
  });
});
