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
import L05 from './L05';
expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
vi.setConfig({ testTimeout: 20000 });
const mount = () =>
  render(
    <MemoryRouter>
      <L05 />
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
    lessonId: 'L04',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);
async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(screen.queryByText('Guardando tu reparto…')).not.toBeInTheDocument());
}

describe('L05 — laboratorio integrado', () => {
  it('bloquea reparto incompleto y monto inválido; recupera el borrador guardado', async () => {
    const view = mount();
    await click('Abrir laboratorio');
    fireEvent.change(screen.getByLabelText('Necesidades'), { target: { value: '40' } });
    expect(screen.getByRole('button', { name: 'Guardar y revisar' })).toBeDisabled();
    await click('Guardar borrador');
    view.unmount();
    mount();
    expect(await screen.findByLabelText('Necesidades')).toHaveValue('40');
    fireEvent.change(screen.getByLabelText('Ingreso mensual de ejemplo (MXN)'), {
      target: { value: '' },
    });
    expect(screen.getByRole('button', { name: 'Guardar borrador' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Guardar y revisar' })).toBeDisabled();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L05' }).first(),
    ).toBeUndefined();
  });
  it('exige cierre explícito y recupera fallo final manteniendo compatibilidad con L12', async () => {
    mount();
    await click('Abrir laboratorio');
    fireEvent.change(screen.getByLabelText('Necesidades'), { target: { value: '60' } });
    fireEvent.change(screen.getByLabelText('Deseos'), { target: { value: '20' } });
    await click('Guardar y revisar');
    expect(await screen.findByText('Tu reparto, antes de seguir.')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L05' }).first(),
    ).toBeUndefined();
    vi.spyOn(lessonDataRepository, 'saveBatch').mockRejectedValueOnce(new Error('disk'));
    await click('Guardar y terminar');
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar');
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L05' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L05' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('presupuesto', 'l5_distribution')).toEqual({
      income: 2500,
      necesidades: 60,
      deseos: 20,
      ahorro: 20,
      score: 100,
    });
    expect(await screen.findByText(/Desbloqueaste L06/)).toBeInTheDocument();
  });
  it('ofrece reintentar una carga fallida sin sustituir el borrador', async () => {
    vi.spyOn(lessonDataRepository, 'load').mockRejectedValueOnce(new Error('disk'));
    mount();
    expect(await screen.findByText('No pudimos recuperar tu reparto.')).toBeInTheDocument();
    await click('Reintentar carga');
    expect(await screen.findByRole('button', { name: 'Abrir laboratorio' })).toBeEnabled();
  });
  it('mantiene el bloqueo previo para invitados', async () => {
    await db.lessonProgress.clear();
    mount();
    expect(await screen.findByText('Lección bloqueada')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Abrir laboratorio' })).not.toBeInTheDocument();
  });
});
