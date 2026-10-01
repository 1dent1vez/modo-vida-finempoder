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
import L13 from './L13';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  for (let index = 1; index <= 12; index += 1)
    await db.lessonProgress.add({
      userId: 'local',
      moduleId: 'ahorro',
      lessonId: `L${String(index).padStart(2, '0')}`,
      completed: true,
      completedAt: new Date().toISOString(),
    });
  await lessonDataRepository.save('ahorro', 'l5_meta', { nombre: 'Fondo médico', monto: 6000 });
  await lessonDataRepository.save('ahorro', 'l11_reto', {
    days: ['2026-09-07', '2026-09-08'],
    dayAmounts: [50, 75],
    totalAcumulado: 125,
  });
});
async function click(name: string) {
  const button = await screen.findByRole('button', { name });
  await waitFor(() => expect(button).toBeEnabled());
  fireEvent.click(button);
}
describe('Ahorro L13', () => {
  it('presenta evidencia neutral y guarda un ajuste revisable', async () => {
    render(
      <MemoryRouter>
        <L13 />
      </MemoryRouter>,
    );
    for (const name of [
      /Meta de referencia/,
      /Plan disponible/,
      /Días registrados/,
      /Monto registrado/,
    ])
      fireEvent.click(await screen.findByRole('button', { name }));
    await click('Elegir un ajuste');
    const difficulty = await screen.findByLabelText('¿Qué está dificultando ahorrar esta semana?');
    fireEvent.change(difficulty, { target: { value: 'Olvido separar el dinero' } });
    fireEvent.change(screen.getByLabelText('¿Qué ajuste pequeño probarás?'), {
      target: { value: 'Crear un recordatorio el viernes' },
    });
    await click('Revisar respuesta');
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L13' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l13_dificultad')).toMatchObject({
      dificultad: 'Olvido separar el dinero',
      ajuste: 'Crear un recordatorio el viernes',
    });
    expect(
      screen.queryByText(/Excelente consistencia|Vas en tiempo|fallaste/),
    ).not.toBeInTheDocument();
  });
});
