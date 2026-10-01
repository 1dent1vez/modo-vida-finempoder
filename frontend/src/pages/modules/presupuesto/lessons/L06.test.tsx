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
import L06 from './L06';
expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'presupuesto',
    lessonId: 'L05',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);

describe('Presupuesto L06', () => {
  it('actualiza, revisa y guarda un balance antes de desbloquear L07', async () => {
    render(
      <MemoryRouter>
        <L06 />
      </MemoryRouter>,
    );
    fireEvent.change(await screen.findByLabelText('Gastos mensuales del ejemplo (MXN)'), {
      target: { value: '3500' },
    });
    expect(screen.getByText('-$500')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y revisar' }));
    expect(await screen.findByText('Hay déficit')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));
    expect(await screen.findByText(/Desbloqueaste L07/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l6_balance_result')).toEqual({
      income: 3000,
      expenses: 3500,
      balance: -500,
    });
  });
});
