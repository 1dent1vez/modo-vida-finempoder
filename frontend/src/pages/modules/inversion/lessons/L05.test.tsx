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
import L05 from './L05';
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
    lessonId: 'L04',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
describe('L05', () => {
  it('compara familias sin cifras comerciales', async () => {
    render(
      <MemoryRouter>
        <L05 />
      </MemoryRouter>,
    );
    for (const n of ['Deuda', 'Participación', 'Fondo colectivo', 'Activo real listado'])
      await c(new RegExp(n));
    await c('Comparar dos familias');
    await c('Deuda');
    await c('Fondo colectivo');
    await c('Comprobar lectura');
    for (const n of [/Riesgo, plazo/, /Puede seguir/, /documentos oficiales/]) await c(n);
    await c('Revisar método');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l05_instrument_map')).not.toBeNull(),
    );
    expect(screen.queryByText(/CETES|\$100|6-7%/)).not.toBeInTheDocument();
  });
});
