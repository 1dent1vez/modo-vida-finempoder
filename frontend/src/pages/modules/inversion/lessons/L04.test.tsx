// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L04 from './L04';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
async function click(n: string | RegExp) {
  const b = await screen.findByRole('button', { name: n });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'inversion',
    lessonId: 'L03',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
describe('Inversión L04', () => {
  it('guarda una fotografía sin declarar aptitud', async () => {
    render(
      <MemoryRouter>
        <L04 />
      </MemoryRouter>,
    );
    for (const q of await screen.findAllByRole('heading', { level: 3 }))
      fireEvent.click(within(q.parentElement!).getByRole('button', { name: 'Sí' }));
    await click('Estimar margen');
    expect(await screen.findByText(/no es capital recomendado/i)).toBeInTheDocument();
    await click('Probar un imprevisto');
    await click('No lo sé todavía');
    fireEvent.change(await screen.findByPlaceholderText(/Liquidez/), {
      target: { value: 'Revisaría liquidez y mi reserva' },
    });
    await click('Revisar fotografía');
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l04_capacity')).not.toBeNull(),
    );
    expect(screen.queryByText(/Tienes capital para invertir|CETES/)).not.toBeInTheDocument();
  });
});
