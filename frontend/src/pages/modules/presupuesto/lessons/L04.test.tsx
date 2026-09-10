// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L04 from './L04';
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
    lessonId: 'L03',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);

describe('Presupuesto L04', () => {
  it('exige corregir una categoría antes de avanzar', async () => {
    render(
      <MemoryRouter>
        <L04 />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByRole('button', { name: /App especializada/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar práctica' }));
    const category = await screen.findByLabelText('Categoría');
    fireEvent.change(category, { target: { value: 'Transporte' } });
    fireEvent.change(screen.getByLabelText('Forma de pago'), { target: { value: 'Efectivo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar y guardar' }));
    expect(await screen.findAllByText(/corresponde a Alimentación/)).toHaveLength(2);
    expect(screen.getByText('Tacos en la entrada')).toBeInTheDocument();
    fireEvent.change(category, { target: { value: 'Alimentación' } });
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar y guardar' }));
    expect(await screen.findByText('Camión a la oficina')).toBeInTheDocument();
  });
});
