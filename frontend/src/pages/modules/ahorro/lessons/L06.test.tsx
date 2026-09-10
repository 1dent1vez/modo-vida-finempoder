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
import L06 from './L06';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (const lessonId of ['L01', 'L02', 'L03', 'L04', 'L05'])
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  await lessonDataRepository.save('ahorro', 'l5_meta', {
    nombre: 'Fondo',
    monto: 6000,
    aportacionMensual: 500,
  });
});
async function click(name: string | RegExp) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Ahorro L06', () => {
  it('crea un ciclo con respuesta para un mes difícil', async () => {
    render(
      <MemoryRouter>
        <L06 />
      </MemoryRouter>,
    );
    await click(/^3 meses/);
    await click('Construir este plan');
    expect(await screen.findByText('Define ritmo y plan alterno.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Aportación mensual del plan'), {
      target: { value: '600' },
    });
    fireEvent.click(screen.getByLabelText('Extender el plazo de la meta'));
    expect(screen.getByText('$1,800')).toBeInTheDocument();
    await click('Revisar mi plan');
    expect(await screen.findByText('Revisa un plan con margen de ajuste.')).toBeInTheDocument();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L06' }).first())?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L07/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('ahorro', 'l6_plan')).toMatchObject({
      horizon: 3,
      totalPlanado: 1800,
      fallback: 'extend',
    });
  });
});
