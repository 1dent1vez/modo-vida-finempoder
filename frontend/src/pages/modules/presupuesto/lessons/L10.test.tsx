// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import { MemoryRouter } from 'react-router-dom';
import { StrictMode } from 'react';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L10, { CRISIS_CHECKS, CRISIS_STORIES } from './L10';

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
    lessonId: 'L09',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);

const mount = () =>
  render(
    <StrictMode>
      <MemoryRouter>
        <L10 />
      </MemoryRouter>
    </StrictMode>,
  );
async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

describe('L10 — respuesta ante una reducción de ingresos', () => {
  it('guarda el recorrido y completa solamente tras revisar el plan', async () => {
    mount();
    expect(await screen.findByText(CRISIS_STORIES[0].situation)).toBeInTheDocument();
    await click('Siguiente caso');
    expect(await screen.findByText(CRISIS_STORIES[1].situation)).toBeInTheDocument();
    await click('Siguiente caso');
    expect(await screen.findByText(CRISIS_STORIES[2].situation)).toBeInTheDocument();
    await click('Comprobar lo aprendido');
    for (let index = 0; index < CRISIS_CHECKS.length; index += 1) {
      const question = CRISIS_CHECKS[index];
      expect(await screen.findByText(question.question)).toBeInTheDocument();
      await click(question.options[question.correct]);
      expect(await screen.findByText(question.feedback)).toBeInTheDocument();
      await click('Confirmar respuesta');
    }
    await click('Haré una lista de recursos y gastos esenciales');
    await click('Guardar y revisar');
    expect(await screen.findByText('Revisa tu primer paso.')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L10' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L10' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('presupuesto', 'l10_crisis_plan')).toEqual({
      plan: 'map',
      answers: { first: 1, 'due-date': 0, cut: 2 },
    });
    expect(await screen.findByText(/Desbloqueaste L11/)).toBeInTheDocument();
  });
});
