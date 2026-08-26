// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);
import { cleanup, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Bajo carga (suite completa en paralelo) fake-indexeddb puede tardar más que
// el timeout por defecto de 1s; se amplía para evitar flakes de timing.
configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 15000 });

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { daysAgoLocalKey } from '../../../../lib/localDate';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L11 from './L11';

function renderL11() {
  return render(
    <MemoryRouter>
      <L11 />
    </MemoryRouter>
  );
}

async function aceptarReto() {
  fireEvent.click(await screen.findByRole('button', { name: /Acepto el reto/ }));
}

async function completarDia(n: number, monto: string) {
  const input = await screen.findByPlaceholderText('$0');
  fireEvent.change(input, { target: { value: monto } });
  fireEvent.click(screen.getByRole('button', { name: `Completar día ${n}` }));
}

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'ahorro',
    lessonId: 'L10',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});

afterEach(() => {
  cleanup();
});

describe('L11 ahorro — micro-reto con días reales', () => {
  it('no permite completar dos días con la misma fecha', async () => {
    renderL11();
    await aceptarReto();
    await completarDia(1, '50');

    await waitFor(() => expect(screen.getByText(/Día 1\/3 completado/)).toBeInTheDocument());
    expect(screen.getByText(/Vuelve mañana para el día 2/)).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('$0')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Completar día 2' })).not.toBeInTheDocument();

    const row = await db.userLessonData.where('key').equals('l11_reto').first();
    expect((row?.data as { days: string[] }).days).toHaveLength(1);
  });

  it('completa el reto con 3 fechas distintas', async () => {
    await lessonDataRepository.save('ahorro', 'l11_reto', {
      days: [daysAgoLocalKey(2), daysAgoLocalKey(1)],
      dayAmounts: [100, 50],
      totalAcumulado: 150,
    });
    renderL11();
    await aceptarReto();
    await completarDia(3, '25');

    await waitFor(() => expect(screen.getByText('Constancia de 3')).toBeInTheDocument());

    // Espera a que el shell termine de persistir la completitud antes de que
    // arranque el siguiente test (que limpia la base en beforeEach).
    await waitFor(async () => {
      const row = await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L11' }).first();
      expect(row?.completed).toBe(true);
    });

    const row = await db.userLessonData.where('key').equals('l11_reto').first();
    const data = row?.data as { days: string[]; totalAcumulado: number; completedAt?: string };
    expect(data.days).toHaveLength(3);
    expect(new Set(data.days).size).toBe(3);
    expect(data.totalAcumulado).toBe(175);
    expect(data.completedAt).toBeTruthy();
  });

  it('migra un payload viejo con completedAt como reto completado sin inventar fechas', async () => {
    await lessonDataRepository.save('ahorro', 'l11_reto', {
      dayAmounts: [100, 50, 25],
      totalAcumulado: 175,
      completedAt: new Date().toISOString(),
    });
    renderL11();

    await waitFor(() => expect(screen.getByText('Constancia de 3')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Acepto el reto/ })).not.toBeInTheDocument();
  });

  it('F5: re-entrada con payload nuevo de 3/3 restaura el badge y el paso 3', async () => {
    await lessonDataRepository.save('ahorro', 'l11_reto', {
      days: [daysAgoLocalKey(2), daysAgoLocalKey(1), daysAgoLocalKey(0)],
      dayAmounts: [100, 50, 25],
      totalAcumulado: 175,
      completedAt: new Date().toISOString(),
    });
    renderL11();

    await waitFor(() => expect(screen.getByText('Constancia de 3')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Acepto el reto/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Total ahorrado: \$175/)).toBeInTheDocument();
  });

  it('migra 1-2 casillas viejas como días con fecha estimada hacia atrás y permite completar hoy', async () => {
    await lessonDataRepository.save('ahorro', 'l11_reto', {
      dayAmounts: [100],
      totalAcumulado: 100,
    });
    renderL11();
    await aceptarReto();

    await waitFor(() => expect(screen.getByText(/Día 1\/3 completado/)).toBeInTheDocument());
    expect(screen.getByText(/Apartado el /)).toBeInTheDocument();
    expect(screen.getByText(/Día 2\/3: toca completar/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('$0')).toBeInTheDocument();
  });
});
