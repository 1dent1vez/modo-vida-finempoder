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
import L15 from './L15';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  for (let i = 1; i <= 14; i++)
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId: `L${String(i).padStart(2, '0')}`,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  await lessonDataRepository.save('ahorro', 'l11_reto', { totalAcumulado: 125 });
});
async function click(name: string) {
  const b = await screen.findByRole('button', { name });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
describe('Ahorro L15', () => {
  it('integra evidencia y un siguiente paso antes de completar', async () => {
    render(
      <MemoryRouter>
        <L15 />
      </MemoryRouter>,
    );
    await click('Empezar mi cierre');
    expect(await screen.findByDisplayValue('125')).toBeInTheDocument();
    await click('Confirmar evidencia');
    fireEvent.change(
      await screen.findByLabelText('¿Durante cuántas semanas practicaste el hábito?'),
      { target: { value: '2' } },
    );
    fireEvent.change(screen.getByLabelText('¿Qué fue difícil?'), {
      target: { value: 'Recordarlo' },
    });
    fireEvent.change(screen.getByLabelText('¿Qué ajuste probarás?'), {
      target: { value: 'Usar alarma' },
    });
    await click('Definir siguiente paso');
    fireEvent.change(await screen.findByLabelText('Mi siguiente meta o práctica'), {
      target: { value: 'Separar 50 el viernes' },
    });
    await click('Revisar mi cierre');
    expect(await lessonDataRepository.load('ahorro', 'l15_cierre')).toBeNull();
    await click('Guardar y completar módulo');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L15' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l15_cierre')).toMatchObject({
      montoTotalAhorrado: 125,
      proximaMeta: 'Separar 50 el viernes',
    });
  });
});
