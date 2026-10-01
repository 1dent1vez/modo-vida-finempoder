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
import L09 from './L09';
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
    lessonId: 'L08',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);
describe('Presupuesto L09', () => {
  it('permite practicar con ejemplo y guarda antes de desbloquear L10', async () => {
    render(
      <MemoryRouter>
        <L09 />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Usar ejemplo' }));
    expect(screen.getByText('$600')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y revisar' }));
    expect(await screen.findByText('Revisa tu meta antes de guardarla.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));
    expect(await screen.findByText(/Desbloqueaste L10/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l9_smart_goal')).toMatchObject({
      monto: 3600,
      aporteMensual: 600,
      example: true,
    });
  });
});
