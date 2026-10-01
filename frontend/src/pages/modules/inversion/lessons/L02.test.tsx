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
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'inversion',
    lessonId: 'L01',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
async function click(name: string | RegExp) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Inversión L02', () => {
  it('compara condiciones y guarda solo al confirmar', async () => {
    render(
      <MemoryRouter>
        <L02 />
      </MemoryRouter>,
    );
    for (const n of ['Disponibilidad', 'Incertidumbre', 'Condiciones', 'Propósito'])
      await click(new RegExp(n));
    await click('Practicar decisiones');
    await click('Priorizar disponibilidad');
    await click('Comparar alternativas y riesgos');
    await click('Falta comparar costos y condiciones');
    await click('Aplicar a una meta');
    fireEvent.change(await screen.findByLabelText('Describe una meta'), {
      target: { value: 'Una meta con fecha flexible' },
    });
    await click('Todavía necesito investigar');
    await click('Revisar criterios');
    expect(await lessonDataRepository.load('inversion', 'l02_comparison')).toBeNull();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'inversion', lessonId: 'L02' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('inversion', 'l02_comparison')).toMatchObject({
      priority: 'Todavía necesito investigar',
    });
    expect(screen.queryByText(/1-4%|CETES|menos de 1 año/)).not.toBeInTheDocument();
  });
});
