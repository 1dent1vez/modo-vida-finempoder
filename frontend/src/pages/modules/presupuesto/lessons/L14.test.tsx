// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L14, { PREGUNTAS } from './L14';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'presupuesto',
    lessonId: 'L13',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
async function click(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('L14', () => {
  it('muestra feedback y completa solo desde la revisión', async () => {
    render(
      <MemoryRouter>
        <L14 />
      </MemoryRouter>,
    );
    for (const q of PREGUNTAS) {
      await click(q.opciones![q.correcta]);
      expect(await screen.findByText(q.explicacion)).toBeInTheDocument();
      await click(q === PREGUNTAS.at(-1) ? 'Confirmar y revisar' : 'Confirmar respuesta');
    }
    expect(await screen.findByText('10 de 10 respuestas correctas')).toBeInTheDocument();
    expect(
      await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L14' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'presupuesto', lessonId: 'L14' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L15/)).toBeInTheDocument();
  });
});
