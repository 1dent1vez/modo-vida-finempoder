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
import L08, { EMOTIONAL_SCENARIOS } from './L08';

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
    lessonId: 'L07',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);

const mount = () =>
  render(
    <MemoryRouter>
      <L08 />
    </MemoryRouter>,
  );

async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

describe('L08 — gasto emocional', () => {
  it('explica cada elección y completa solo después de revisar la estrategia', async () => {
    mount();
    for (const scenario of EMOTIONAL_SCENARIOS) {
      expect(await screen.findByText(scenario.title)).toBeInTheDocument();
      await click(
        scenario.lens === 'planned'
          ? 'Planeado'
          : scenario.lens === 'emotional'
            ? 'Influido por la emoción'
            : 'Impulsivo',
      );
      expect(await screen.findByText(scenario.context)).toBeInTheDocument();
      await click('Confirmar lectura');
    }
    await click('Esperar 24 horas antes de una compra no prevista');
    await click('Guardar y revisar');
    expect(await screen.findByText('Revisa tu estrategia.')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L08' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L08' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('presupuesto', 'l8_strategy')).toEqual({
      strategy: 'Esperar 24 horas antes de una compra no prevista',
      triggers: [],
    });
    expect(await screen.findByText(/Desbloqueaste L09/)).toBeInTheDocument();
  });
});
