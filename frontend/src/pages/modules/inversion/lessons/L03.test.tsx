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
import L03 from './L03';
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
    lessonId: 'L02',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});
describe('Inversión L03', () => {
  it('enseña variables sin predecir rendimientos', async () => {
    render(
      <MemoryRouter>
        <L03 />
      </MemoryRouter>,
    );
    for (const n of ['Rendimiento', 'Riesgo', 'Plazo', 'Liquidez', 'Costos'])
      await click(new RegExp(n));
    await click('Conectar variables');
    await click('Que debes revisar las demás variables');
    await click('Comprobar lectura');
    for (const n of [
      'Liquidez y condiciones',
      'Un resultado distinto al esperado',
      'Verificar entidad, condiciones y alertas',
    ])
      await click(n);
    await click('Revisar mapa');
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l03_vocabulary')).not.toBeNull(),
    );
    expect(screen.queryByText(/Rendimiento: ~|CETES|BMV/)).not.toBeInTheDocument();
  });
});
