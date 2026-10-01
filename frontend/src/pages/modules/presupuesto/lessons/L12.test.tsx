// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L12 from './L12';
expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  vi.restoreAllMocks();
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'presupuesto',
    lessonId: 'L11',
    completed: true,
    completedAt: new Date().toISOString(),
  });
  await lessonDataRepository.save('presupuesto', 'l5_distribution', { income: 3000 });
});
afterEach(cleanup);
describe('Presupuesto L12', () => {
  it('separa revisión, guardado y desbloqueo de L13', async () => {
    render(
      <MemoryRouter>
        <L12 />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /Construir mi presupuesto/ }));
    const amounts = screen.getAllByRole('spinbutton');
    for (const [index, value] of [
      [1, '500'],
      [2, '300'],
      [3, '600'],
    ] as const)
      fireEvent.change(amounts[index], { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: /Revisar mi presupuesto/ }));
    expect(await screen.findByText(/resultado que se guardará/)).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L12' }).first(),
    ).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));
    expect(await screen.findByText(/Desbloqueaste L13/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l12_budget')).toMatchObject({
      totalIngresos: 3000,
      totalGastos: 1400,
      balance: 1600,
    });
  });
});
