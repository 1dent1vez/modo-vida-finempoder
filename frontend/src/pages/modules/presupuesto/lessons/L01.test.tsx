// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, configure, fireEvent, render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L01 from './L01';

expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
configure({ asyncUtilTimeout: 8000 });
beforeEach(async () => {
  vi.restoreAllMocks();
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
});
afterEach(cleanup);
const mount = () =>
  render(
    <MemoryRouter>
      <L01 />
    </MemoryRouter>,
  );

describe('Presupuesto L01', () => {
  it('exige observación y clasificación antes de revisar', async () => {
    mount();
    const next = await screen.findByRole('button', { name: 'Clasificar gastos' });
    expect(next).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Una semana' }));
    fireEvent.click(next);
    expect(await screen.findByText('¿Qué se decidió antes de gastar?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revisar patrón' })).toBeDisabled();
  });

  it('guarda antes de completar y desbloquea L02', async () => {
    mount();
    fireEvent.click(await screen.findByRole('button', { name: 'Dos semanas' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clasificar gastos' }));
    for (const button of await screen.findAllByRole('button', { name: 'Lo planeé' }))
      fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: 'Revisar patrón' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Guardar y terminar' }));
    expect(await screen.findByText(/Desbloqueaste L02/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l1_spending_awareness')).toMatchObject({
      expectation: 'Dos semanas',
    });
  });
});
