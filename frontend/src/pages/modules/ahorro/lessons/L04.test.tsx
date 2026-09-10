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
import L04 from './L04';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  for (const lessonId of ['L01', 'L02', 'L03'])
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string | RegExp) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('Ahorro L04', () => {
  it('convierte una fricción en un experimento semanal revisable', async () => {
    render(
      <MemoryRouter>
        <L04 />
      </MemoryRouter>,
    );
    await click('Detectar señales');
    await click('Fricción');
    expect(await screen.findByText(/regla ligada al momento/)).toBeInTheDocument();
    await click('Aliado');
    await click('Confirmar señal');
    expect(await screen.findByText(/Mantener activas alertas/)).toBeInTheDocument();
    await click('Fricción');
    await click('Confirmar señal');
    expect(await screen.findByText(/Tener una meta clara/)).toBeInTheDocument();
    await click('Aliado');
    await click('Confirmar señal');
    expect(await screen.findByText(/Mezclar el ahorro/)).toBeInTheDocument();
    await click('Fricción');
    await click('Confirmar y elegir ajuste');
    expect(await screen.findByText('Diseña una respuesta pequeña.')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Alertas y compras impulsivas'));
    fireEvent.click(screen.getByLabelText('Silenciar alertas de compra'));
    await click('Revisar mi ajuste');
    expect(
      await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L04' }).first(),
    ).toBeUndefined();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L04' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l4_aliados')).toMatchObject({
      saboteador: 'offers',
      aliadoElegido: 'silence',
    });
  });
});
