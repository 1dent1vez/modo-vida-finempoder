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
beforeEach(async () => {
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((table) => table.clear()));
  for (const lessonId of ['L01', 'L02'])
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
describe('Ahorro L03', () => {
  it('distingue una estimación y guarda la verificación elegida', async () => {
    render(
      <MemoryRouter>
        <L03 />
      </MemoryRouter>,
    );
    await click('Abrir simulador');
    fireEvent.change(await screen.findByLabelText('Tasa anual ilustrativa'), {
      target: { value: '5' },
    });
    fireEvent.click(screen.getByLabelText('Condiciones y costos'));
    await click('Comprobar lo aprendido');
    await click('Sí, porque usa una fórmula');
    expect(await screen.findByText(/tasa, los costos/)).toBeInTheDocument();
    await click('No, es una estimación con supuestos');
    await click('Confirmar respuesta');
    expect(await screen.findByText(/Qué debes revisar antes de elegir/)).toBeInTheDocument();
    await click('Tasa, costos, acceso, condiciones y protección aplicable');
    await click('Confirmar y revisar');
    await click('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'ahorro', lessonId: 'L03' }).first())?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('ahorro', 'l3_savings_return')).toMatchObject({
      rate: 5,
      verify: 'conditions',
    });
  });
});
