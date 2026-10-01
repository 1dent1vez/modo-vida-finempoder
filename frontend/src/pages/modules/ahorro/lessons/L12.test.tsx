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
import L12 from './L12';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  for (let index = 1; index <= 11; index += 1)
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId: `L${String(index).padStart(2, '0')}`,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('Ahorro L12', () => {
  it('guarda un escenario hipotético con sus supuestos', async () => {
    render(
      <MemoryRouter>
        <L12 />
      </MemoryRouter>,
    );
    await click('Abrir simulador');
    expect(await screen.findByText(/No incluye comisiones/)).toBeInTheDocument();
    await click('Interpretar resultado');
    await click('Que ese sería el resultado si se cumplieran los supuestos');
    await click('Revisar escenario');
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L12' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l12_compound_scenario')).toMatchObject({
      illustrativeAnnualRate: 5,
      assumptions: expect.arrayContaining(['constant-rate']),
    });
    expect(screen.queryByText(/CETES|Acciones \(estimado\)/)).not.toBeInTheDocument();
  });
});
