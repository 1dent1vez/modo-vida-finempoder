// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L02, { INCOME_ITEMS } from './L02';
expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.setConfig({ testTimeout: 20000 });
const mount = () =>
  render(
    <MemoryRouter>
      <L02 />
    </MemoryRouter>,
  );
beforeEach(async () => {
  vi.restoreAllMocks();
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'presupuesto',
    lessonId: 'L01',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);
async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(screen.queryByText('Guardando tu avance…')).not.toBeInTheDocument());
}
async function choose(i: number) {
  await click(new RegExp(`Ingreso ${INCOME_ITEMS[i].category}`));
  await click('Comprobar');
}
describe('L02 migrada — integración real con ModuleKit', () => {
  it('conserva respuestas, primera puntuación y correcciones al recargar', async () => {
    const view = mount();
    await click('Comenzar clasificación');
    await click(/Ingreso variable/);
    await click('Comprobar');
    expect(await screen.findByText('Finni · Revisa una pista')).toBeInTheDocument();
    await choose(0);
    await click('Siguiente ingreso');
    view.unmount();
    mount();
    expect(await screen.findByText('Mesada semanal')).toBeInTheDocument();
    const draft = await lessonDataRepository.load<{ index: number; firstAnswers: string[] }>(
      'presupuesto',
      'l2_classification:v1',
    );
    expect(draft?.index).toBe(1);
    expect(draft?.firstAnswers).toEqual(['variable']);
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L02' }).first(),
    ).toBeUndefined();
  });
  it('guarda antes de completar, recupera un fallo final y desbloquea la siguiente lección', async () => {
    mount();
    await click('Comenzar clasificación');
    for (let i = 0; i < INCOME_ITEMS.length; i++) {
      await choose(i);
      await click(i === 8 ? 'Revisar lo aprendido' : 'Siguiente ingreso');
    }
    expect(screen.getByText('Revisaste los 9 ingresos.')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L02' }).first(),
    ).toBeUndefined();
    const save = vi.spyOn(lessonDataRepository, 'saveBatch');
    save.mockRejectedValueOnce(new Error('disk'));
    await click('Guardar y terminar');
    expect(screen.getByRole('alert')).toHaveTextContent('No pudimos guardar');
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L02' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L02' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(screen.getByText(/Desbloqueaste L03/)).toBeInTheDocument();
    const result = await lessonDataRepository.load<{ items: unknown[]; score: number }>(
      'presupuesto',
      'l2_incomes',
    );
    expect(result?.items).toHaveLength(9);
    expect(result?.score).toBe(100);
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L02' }).count(),
    ).toBe(1);
  });
  it('respeta el bloqueo y no solicita login en modo invitado', async () => {
    await db.lessonProgress.clear();
    mount();
    expect(await screen.findByText('Lección bloqueada')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Comenzar clasificación' }),
    ).not.toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l2_classification:v1')).toBeNull();
  });
});
