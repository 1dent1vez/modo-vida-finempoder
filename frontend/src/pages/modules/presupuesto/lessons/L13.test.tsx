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
import L13, { buildBudgetInsights } from './L13';

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
    lessonId: 'L12',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);
const mount = () =>
  render(
    <MemoryRouter>
      <L13 />
    </MemoryRouter>,
  );
async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

describe('L13 — lectura guiada', () => {
  it('describe variables sin inferir que son entretenimiento', () => {
    const insight = buildBudgetInsights({ pctVariables: 40, balance: -50 });
    expect(insight.find((item) => item.id === 'variable')?.explanation).toMatch(
      /necesidades y deseos/,
    );
    expect(insight.find((item) => item.id === 'balance')?.value).toBe('−$50');
  });
  it('ofrece ejemplo ficticio y completa después de revisar una prioridad', async () => {
    mount();
    await click('Practicar con un ejemplo ficticio');
    for (let index = 0; index < 3; index += 1) await click('Siguiente señal');
    await click('Elegir una prioridad');
    await click(/Margen del mes/);
    await click('Guardar y revisar');
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L13' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L13' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('presupuesto', 'l13_feedback')).toEqual({
      priority: 'balance',
      example: true,
    });
    expect(await screen.findByText(/Desbloqueaste L14/)).toBeInTheDocument();
  });
});
