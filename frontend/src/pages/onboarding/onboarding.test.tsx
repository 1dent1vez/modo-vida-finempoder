// @vitest-environment jsdom
// F7-ONBOARDING: Flujo de onboarding de 3 pantallas: guest completo (vía el
// gate de entrada), usuario con sesión, skips, persistencia del chip, meta en
// Home (mismo store dailyGoal), analytics y sugerencia de ruta por chip.
// fake-indexeddb/auto MUST be first: patches global indexedDB before Dexie.
import 'fake-indexeddb/auto';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { db } from '@/db/finempoderDb';
import { RootGate } from '../../App';
import { useAuth } from '../../store/auth';
import { useDailyGoal } from '../../store/dailyGoal';
import { useProgress } from '../../store/progress';
import { isOnboarded } from '@/shared/utils/onboarding';
import { track } from '@/lib/analytics';
import Screen1 from './Screen1';
import Screen2 from './Screen2';
import Screen3 from './Screen3';
import Home from '../home/Home';

vi.mock('@/lib/supabase', () => ({
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

// Mock parcial: solo track se espiá; EVENTOS/identify/analyticsEnabled reales.
vi.mock('@/lib/analytics', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/lib/analytics')>();
  return { ...mod, track: vi.fn() };
});

function LessonStub({ module }: { module: string }) {
  const { lessonId } = useParams<{ lessonId: string }>();
  return <div>{module}-LESSON-{lessonId}</div>;
}

let qc: QueryClient;

/** Réplica de las rutas reales de App.tsx para los puntos tocados por F7. */
function renderFlow(initialEntries: string[] = ['/']) {
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/" element={<RootGate />} />
          <Route path="/onboarding/1" element={<Screen1 />} />
          <Route path="/onboarding/2" element={<Screen2 />} />
          <Route path="/onboarding/3" element={<Screen3 />} />
          <Route
            path="/app/presupuesto/lesson/:lessonId"
            element={<LessonStub module="PRESUPUESTO" />}
          />
          <Route
            path="/app/ahorro/lesson/:lessonId"
            element={<LessonStub module="AHORRO" />}
          />
          <Route path="/app" element={<div>APP-HOME</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function renderHomeViaGate() {
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<RootGate />} />
          <Route path="/app" element={<Home />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

const SKIP_CASES = [
  { entry: '/onboarding/1', title: 'Aprende a tomar el control de tu dinero' },
  { entry: '/onboarding/2', title: 'Tu meta diaria' },
  { entry: '/onboarding/3', title: 'Tu primera lección te espera' },
];

beforeEach(async () => {
  qc = new QueryClient();
  localStorage.clear();
  await db.lessonProgress.clear();
  useAuth.getState().clearAuth();
  useAuth.setState({ hydrated: true });
  useProgress.getState().reset();
  useDailyGoal.getState().setLevel(null);
  vi.mocked(track).mockClear();
});

afterEach(() => {
  cleanup();
});

describe('F7-Onboarding: gate de entrada', () => {
  it('sin onboarded: la raíz redirige a /onboarding/1 (guest userId local)', async () => {
    renderFlow(['/']);
    expect(await screen.findByText('Aprende a tomar el control de tu dinero')).toBeVisible();
  });

  it('onboarded: la raíz entra directo a /app', () => {
    localStorage.setItem('fe_onboarded_user_local', '1');
    renderFlow(['/']);
    expect(screen.getByText('APP-HOME')).toBeVisible();
  });
});

describe('F7-Onboarding: flujo guest completo', () => {
  it('sin sesión: chips → meta → Comenzar aterriza en Presupuesto L01, isOnboarded y meta en Home', async () => {
    renderFlow(['/']);
    expect(await screen.findByText('Aprende a tomar el control de tu dinero')).toBeVisible();

    // Continuar sin elegir = default 'Recién empiezo' (cero fricción).
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Tu meta diaria')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: /Intensa/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Tu primera lección te espera')).toBeVisible();

    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }));
    expect(await screen.findByText('PRESUPUESTO-LESSON-L01')).toBeVisible();

    expect(isOnboarded('local')).toBe(true);
    expect(useDailyGoal.getState().level).toBe('intense');
    expect(JSON.parse(localStorage.getItem('fe_onboarding_prefs') ?? '{}')).toEqual({
      confianza: 'recien-empiezo',
    });

    // La meta elegida se refleja en Home (mismo store dailyGoal), vía el gate.
    cleanup();
    renderHomeViaGate();
    expect(await screen.findByText('Meta Intensa · 300 XP')).toBeVisible();
  });

  it('chip "Ya ahorro, quiero mejorar" sugiere Ahorro L01 al comenzar', async () => {
    renderFlow(['/']);
    await screen.findByText('Aprende a tomar el control de tu dinero');
    fireEvent.click(screen.getByRole('button', { name: 'Ya ahorro, quiero mejorar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Tu meta diaria');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Tu primera lección te espera');
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }));
    expect(await screen.findByText('AHORRO-LESSON-L01')).toBeVisible();
    expect(isOnboarded('local')).toBe(true);
  });
});

describe('F7-Onboarding: usuario con sesión', () => {
  it('completa el flujo y NO lo vuelve a ver (isOnboarded por usuario)', async () => {
    useAuth.getState().setAuth('token', { id: 'u1', email: 'ana@finempoder.com' });

    renderFlow(['/']);
    expect(await screen.findByText('Aprende a tomar el control de tu dinero')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Tu meta diaria');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Tu primera lección te espera');
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }));
    expect(await screen.findByText('PRESUPUESTO-LESSON-L01')).toBeVisible();
    expect(isOnboarded('u1', 'ana@finempoder.com')).toBe(true);

    cleanup();
    renderFlow(['/']);
    expect(screen.getByText('APP-HOME')).toBeVisible();
    expect(screen.queryByText('Aprende a tomar el control de tu dinero')).toBeNull();
  });
});

describe('F7-Onboarding: skip en cada pantalla', () => {
  it.each(SKIP_CASES)('skip en $entry → /app y marca onboarded', async ({ entry, title }) => {
    renderFlow([entry]);
    expect(await screen.findByText(title)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    expect(screen.getByText('APP-HOME')).toBeVisible();
    expect(isOnboarded('local')).toBe(true);
  });

  it('"Ahora no, explorar" en Screen3 → /app y marca onboarded', async () => {
    renderFlow(['/onboarding/3']);
    await screen.findByText('Tu primera lección te espera');
    fireEvent.click(screen.getByRole('button', { name: 'Ahora no, explorar' }));
    expect(screen.getByText('APP-HOME')).toBeVisible();
    expect(isOnboarded('local')).toBe(true);
  });
});

describe('F7-Onboarding: persistencia del chip', () => {
  it('sin elegir se persiste el default "Recién empiezo" al continuar', () => {
    renderFlow(['/onboarding/1']);
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(JSON.parse(localStorage.getItem('fe_onboarding_prefs') ?? '{}')).toEqual({
      confianza: 'recien-empiezo',
    });
  });

  it('el chip elegido se guarda en fe_onboarding_prefs y se preselecciona al volver', () => {
    renderFlow(['/onboarding/1']);
    fireEvent.click(screen.getByRole('button', { name: 'Ya ahorro, quiero mejorar' }));
    expect(JSON.parse(localStorage.getItem('fe_onboarding_prefs') ?? '{}')).toEqual({
      confianza: 'ya-ahorro',
    });

    cleanup();
    renderFlow(['/onboarding/1']);
    expect(screen.getByRole('button', { name: 'Ya ahorro, quiero mejorar' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});

describe('F7-Onboarding: analytics', () => {
  it('track recibe los eventos del flujo en orden', async () => {
    renderFlow(['/']);
    await screen.findByText('Aprende a tomar el control de tu dinero');
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Tu meta diaria');
    fireEvent.click(screen.getByRole('button', { name: /Regular/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await screen.findByText('Tu primera lección te espera');
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar' }));
    await screen.findByText('PRESUPUESTO-LESSON-L01');

    const calls = vi.mocked(track).mock.calls;
    expect(calls.map((c) => c[0])).toEqual([
      'onboarding_started',
      'onboarding_step',
      'onboarding_step',
      'onboarding_step',
      'onboarding_completed',
    ]);
    expect(calls[1][1]).toEqual({ step: 1 });
    expect(calls[2][1]).toEqual({ step: 2 });
    expect(calls[3][1]).toEqual({ step: 3 });
  });

  it('skip no emite onboarding_completed', async () => {
    renderFlow(['/onboarding/1']);
    await screen.findByText('Aprende a tomar el control de tu dinero');
    fireEvent.click(screen.getByRole('button', { name: 'Saltar' }));
    const calls = vi.mocked(track).mock.calls.map((c) => c[0]);
    expect(calls).toContain('onboarding_started');
    expect(calls).toContain('onboarding_step');
    expect(calls).not.toContain('onboarding_completed');
  });
});
