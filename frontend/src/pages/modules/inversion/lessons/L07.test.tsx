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
import L07 from './L07';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
async function c(n: string | RegExp) {
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
    lessonId: 'L06',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
describe('L07', () => {
  it('compara modelos sin promocionar plataformas', async () => {
    render(
      <MemoryRouter>
        <L07 />
      </MemoryRouter>,
    );
    await c(/Vehículo colectivoToca/);
    await c(/Participación directaToca/);
    await c('Preparar investigación');
    await c('Vehículo colectivo');
    fireEvent.change(await screen.findByPlaceholderText(/Qué costos/), {
      target: { value: '¿Qué costos y activos contiene?' },
    });
    await c('Comprobar diferencias');
    await c('No; depende de su estrategia y activos');
    await c('Distribuir exposición entre distintos activos');
    await c('No; hay que verificar registros vigentes');
    await c('Revisar análisis');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l07_models')).not.toBeNull(),
    );
    expect(screen.queryByText(/GBM|Kuspit|Bursanet|\$200/)).not.toBeInTheDocument();
  });
});
