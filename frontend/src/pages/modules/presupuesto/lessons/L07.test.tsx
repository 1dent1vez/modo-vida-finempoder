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
import L07, { CRISIS_SCENARIOS } from './L07';

expect.extend(matchers);
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
const mount = () =>
  render(
    <MemoryRouter>
      <L07 />
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
    lessonId: 'L06',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
afterEach(cleanup);

async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
  await waitFor(() => expect(screen.queryByText('Guardando tu decisión…')).not.toBeInTheDocument());
}

async function choose(name: string) {
  const option = await screen.findByRole('radio', { name });
  fireEvent.click(option);
}

describe('L07 — escenarios de decisiones', () => {
  it('muestra la consecuencia, permite reconsiderar y conserva la decisión confirmada', async () => {
    const view = mount();
    await click('Comenzar escenarios');
    await choose(CRISIS_SCENARIOS[0].options[1].label);
    await click('Ver consecuencia');
    expect(await screen.findByText(CRISIS_SCENARIOS[0].options[1].liquidity)).toBeInTheDocument();
    await click('Reconsiderar');
    await choose(CRISIS_SCENARIOS[0].options[2].label);
    await click('Ver consecuencia');
    await click('Confirmar decisión');
    view.unmount();
    mount();
    expect(await screen.findByText(CRISIS_SCENARIOS[1].title)).toBeInTheDocument();
    const saved = await lessonDataRepository.load<{ decisions: Record<string, string> }>(
      'presupuesto',
      'l7_decisions:v1',
    );
    expect(saved?.decisions.transport).toBe('postpone-clothes');
  });

  it('finaliza solo después del resumen y recupera un fallo final', async () => {
    mount();
    await click('Comenzar escenarios');
    for (let index = 0; index < CRISIS_SCENARIOS.length; index += 1) {
      await choose(CRISIS_SCENARIOS[index].options[2].label);
      await click('Ver consecuencia');
      await click(index === 2 ? 'Confirmar y revisar' : 'Confirmar decisión');
    }
    expect(await screen.findByText('Tus decisiones y sus intercambios')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L07' }).first(),
    ).toBeUndefined();
    vi.spyOn(lessonDataRepository, 'saveBatch').mockRejectedValueOnce(new Error('disk'));
    await click('Guardar y terminar');
    expect(await screen.findByRole('alert')).toHaveTextContent('No pudimos guardar');
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L07' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L07' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L08/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('presupuesto', 'l7_decisions')).toEqual({
      decisions: { transport: 'postpone-clothes', printing: 'subscription', concert: 'search' },
      score: 100,
    });
  });

  it('maneja error de carga y respeta el bloqueo del invitado', async () => {
    vi.spyOn(lessonDataRepository, 'load').mockRejectedValueOnce(new Error('disk'));
    const view = mount();
    expect(await screen.findByText('No pudimos recuperar tus decisiones.')).toBeInTheDocument();
    await click('Reintentar carga');
    expect(await screen.findByRole('button', { name: 'Comenzar escenarios' })).toBeEnabled();
    view.unmount();
    await db.lessonProgress.clear();
    mount();
    expect(await screen.findByText('Lección bloqueada')).toBeInTheDocument();
  });
});
