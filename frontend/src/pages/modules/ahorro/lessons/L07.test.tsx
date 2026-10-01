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
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (const lessonId of ['L01', 'L02', 'L03', 'L04', 'L05', 'L06'])
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string | RegExp) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Ahorro L07', () => {
  it('usa ingresos recientes para guardar una regla flexible', async () => {
    render(
      <MemoryRouter>
        <L07 />
      </MemoryRouter>,
    );
    await click(/^Principalmente variable/);
    await click('Crear referencia');
    expect(await screen.findByText('Construye una referencia prudente.')).toBeInTheDocument();
    for (const [i, v] of ['1500', '3000', '2200'].entries())
      fireEvent.change(screen.getByLabelText(`Ingreso del periodo ${i + 1}`), {
        target: { value: v },
      });
    fireEvent.change(screen.getByLabelText('Porcentaje para explorar'), {
      target: { value: '12' },
    });
    expect(screen.getByText(/aproximadamente \$180/)).toBeInTheDocument();
    await click('Elegir estrategia');
    expect(await screen.findByText('Elige cómo vas a ajustar.')).toBeInTheDocument();
    await click(/^Porcentaje de cada ingreso/);
    await click('Revisar mi regla');
    expect(await screen.findByText('Revisa una regla flexible.')).toBeInTheDocument();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L07' }).first())?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L08/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('ahorro', 'l7_estrategia')).toMatchObject({
      estrategia: 'percentage',
      ingresoBase: 1500,
      porcentaje: 12,
    });
  });
});
