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
import L08 from './L08';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (const lessonId of ['L01', 'L02', 'L03', 'L04', 'L05', 'L06', 'L07'])
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
    });
});
async function click(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('Ahorro L08', () => {
  it('crea una referencia personal y una regla de uso', async () => {
    render(
      <MemoryRouter>
        <L08 />
      </MemoryRouter>,
    );
    fireEvent.click(await screen.findByLabelText('Gasto de salud no planeado'));
    await click('Calcular mi referencia');
    expect(await screen.findByText('Define el tamaño y una regla de uso.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Gastos esenciales mensuales'), {
      target: { value: '4000' },
    });
    fireEvent.change(screen.getByLabelText('Meses de cobertura'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Aportación mensual al fondo'), {
      target: { value: '1000' },
    });
    fireEvent.click(screen.getByLabelText('Ambas condiciones'));
    expect(screen.getByText('$12,000')).toBeInTheDocument();
    await click('Revisar mi fondo');
    expect(await screen.findByText('Revisa tu primera referencia.')).toBeInTheDocument();
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L08' }).first())?.completed,
      ).toBe(true),
    );
    expect(await screen.findByText(/Desbloqueaste L09/)).toBeInTheDocument();
    expect(await lessonDataRepository.load('ahorro', 'l8_fondo')).toMatchObject({
      metaObjetivo: 12000,
      mesesCobertura: 3,
      reglaUso: 'both',
    });
  });
});
