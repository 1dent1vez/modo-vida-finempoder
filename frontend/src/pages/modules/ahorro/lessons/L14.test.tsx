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
import L14 from './L14';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (let i = 1; i <= 13; i++)
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId: `L${String(i).padStart(2, '0')}`,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Ahorro L14', () => {
  it('evalúa criterios vigentes y guarda solo al cierre', async () => {
    render(
      <MemoryRouter>
        <L14 />
      </MemoryRouter>,
    );
    await click('Empezar evaluación');
    for (const answer of [
      'Apartar ahorro antes de distribuir el resto',
      'Tiene una institución, contrato y registro verificables',
      'Una regla flexible basada en cada ingreso',
      'Un escenario condicionado a tasa, plazo y aportaciones',
      'Revisando institución, producto y límite vigente en la fuente oficial',
    ]) {
      await click(answer);
      await click(
        answer.includes('fuente oficial') ? 'Confirmar y revisar' : 'Confirmar respuesta',
      );
    }
    expect(await lessonDataRepository.load('ahorro', 'l14_quiz_result')).toBeNull();
    await click('Guardar resultado y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L14' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l14_quiz_result')).toMatchObject({
      score: 5,
      total: 5,
    });
    expect(screen.queryByText(/3\.5 millones|3 veces más/)).not.toBeInTheDocument();
  });
});
