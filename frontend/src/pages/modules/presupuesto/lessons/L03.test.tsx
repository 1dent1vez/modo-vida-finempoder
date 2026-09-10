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
import L03 from './L03';

expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
const mount = () =>
  render(
    <MemoryRouter>
      <L03 />
    </MemoryRouter>,
  );

beforeEach(async () => {
  vi.restoreAllMocks();
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'presupuesto',
    lessonId: 'L02',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);

describe('L03 — observación de gastos hormiga', () => {
  it('calcula el impacto y exige tres ejemplos antes de revisar', async () => {
    mount();
    const review = await screen.findByRole('button', { name: 'Ver impacto' });
    expect(review).toBeDisabled();
    for (const name of [/Café fuera/, /Snack por/, /Costo de envío/])
      fireEvent.click(screen.getByRole('button', { name }));
    expect(screen.getByText('$373')).toBeInTheDocument();
    await waitFor(() => expect(review).toBeEnabled());
  });

  it('guarda el resultado antes de completar y desbloquea L04', async () => {
    mount();
    for (const name of [/Café fuera/, /Snack por/, /Costo de envío/])
      fireEvent.click(await screen.findByRole('button', { name }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver impacto' }));
    expect(await screen.findByText('Tu selección de ejemplo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));
    expect(await screen.findByText(/Desbloqueaste L04/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l3_gastos_hormiga')).toMatchObject({
      totalWeekly: 373,
      personalGastos: [],
    });
  });

  it('ofrece recuperación si falla la carga', async () => {
    vi.spyOn(lessonDataRepository, 'load').mockRejectedValueOnce(new Error('disk'));
    mount();
    expect(await screen.findByText('No pudimos recuperar tu actividad.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar carga' }));
    expect(await screen.findByRole('button', { name: 'Ver impacto' })).toBeDisabled();
  });
});
