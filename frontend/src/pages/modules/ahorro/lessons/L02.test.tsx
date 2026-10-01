// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L02 from './L02';

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'ahorro',
    lessonId: 'L01',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}

describe('Ahorro L02', () => {
  it('permite reconsiderar, crear una estrategia y guardar antes de completar', async () => {
    render(
      <MemoryRouter>
        <L02 />
      </MemoryRouter>,
    );
    await click('Practicar con casos');
    await click('Informal');
    expect(await screen.findByText(/opción formal puede aportar registro/)).toBeInTheDocument();
    await click('Formal');
    await click('Confirmar caso');
    expect(await screen.findByText('Meta con apoyo del grupo')).toBeInTheDocument();
    await click('Informal');
    await click('Confirmar caso');
    expect(await screen.findByText('Acceso y resguardo')).toBeInTheDocument();
    await click('Combinado');
    await click('Confirmar y crear mi regla');
    expect(await screen.findByText('Construye una regla personal.')).toBeInTheDocument();
    fireEvent.click(await screen.findByLabelText('Combinado'));
    fireEvent.click(await screen.findByLabelText(/Protección/));
    await click('Revisar estrategia');
    expect(
      await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L02' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L02' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l2_savings_options')).toMatchObject({
      plan: 'combined',
      priority: 'protection',
    });
  });
});
