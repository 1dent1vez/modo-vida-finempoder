// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import type { ComponentType } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L11 from './L11';
import L12 from './L12';
import L13 from './L13';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  cleanup();
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
});
async function mount(Component: ComponentType, previous: string, heading: RegExp) {
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'inversion',
    lessonId: previous,
    completed: true,
    completedAt: new Date().toISOString(),
  });
  render(
    <MemoryRouter>
      <Component />
    </MemoryRouter>,
  );
  expect(await screen.findByRole('heading', { name: heading })).toBeInTheDocument();
  expect(
    screen.queryByText(
      /retención de|Histórico: CETES|Instrumentos recomendados|GBM\+|INEGI, julio/,
    ),
  ).not.toBeInTheDocument();
}
describe('Inversión L11-L13', () => {
  it('L11 abre el lector de costos sin impuesto universal', async () =>
    mount(L11, 'L10', /rendimiento anunciado/i));
  it('L12 abre el lector de valor real sin datos caducos', async () =>
    mount(L12, 'L11', /Nominal y real/i));
  it('L13 inicia el plan por criterios sin recomendar producto', async () =>
    mount(L13, 'L12', /plan empieza/i));
});
