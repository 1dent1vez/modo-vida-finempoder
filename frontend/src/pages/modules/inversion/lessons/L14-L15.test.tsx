// @vitest-environment jsdom
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MemoryRouter } from 'react-router-dom';
import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L14 from './L14';
import L15 from './L15';
vi.mock('canvas-confetti', () => ({ default: vi.fn() }));
async function c(n: string | RegExp) {
  const b = await screen.findByRole('button', { name: n });
  await waitFor(() => expect(b).toBeEnabled());
  fireEvent.click(b);
}
async function seed(id: string) {
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'inversion',
    lessonId: id,
    completed: true,
    completedAt: new Date().toISOString(),
  });
}
beforeEach(async () => {
  cleanup();
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
});
describe('Inversión L14-L15', () => {
  it('L14 guarda pendientes sin emitir luz verde', async () => {
    await seed('L13');
    render(
      <MemoryRouter>
        <L14 />
      </MemoryRouter>,
    );
    for (const n of [
      'Estabilidad',
      'Meta y plazo',
      'Comprensión',
      'Evidencia',
      'Regla de decisión',
    ])
      await c(new RegExp(n));
    await c('Aplicar criterios');
    await c('Tengo evidencia suficiente o pendientes concretos');
    fireEvent.change(await screen.findByPlaceholderText(/Escribe tu criterio/), {
      target: { value: 'Verificaré los costos y la salida' },
    });
    await c('Comprobar decisiones');
    await c('No');
    await c('Es un pendiente para investigar');
    await c('No; debe explicar y señalar límites');
    await c('Revisar aprendizaje');
    expect(await lessonDataRepository.load('inversion', 'l14_readiness_review')).toBeNull();
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l14_readiness_review')).not.toBeNull(),
    );
    expect(screen.queryByText(/Luz verde|abre tu cuenta|cetesdirecto/)).not.toBeInTheDocument();
  });
  it('L15 completa por método y conserva el resultado para el badge derivado', async () => {
    await seed('L14');
    render(
      <MemoryRouter>
        <L15 />
      </MemoryRouter>,
    );
    for (const n of ['Pausar', 'Verificar', 'Comparar', 'Decidir', 'Revisar'])
      await c(new RegExp(n));
    await c('Aplicar criterios');
    await c('Revisar el plan con la información nueva');
    fireEvent.change(await screen.findByPlaceholderText(/Escribe tu criterio/), {
      target: { value: 'Volveré a verificar documentos y riesgos' },
    });
    await c('Comprobar decisiones');
    await c('Un proceso coherente con la información disponible');
    await c('Se pausa la decisión');
    await c('Explicar criterios, pendientes y revisión');
    await c('Revisar aprendizaje');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(
        (await db.lessonProgress.where({ moduleId: 'inversion', lessonId: 'L15' }).first())
          ?.completed,
      ).toBe(true),
    );
    expect(await lessonDataRepository.load('inversion', 'l15_resultado')).toMatchObject({
      choice: 'Revisar el plan con la información nueva',
    });
    expect(
      screen.queryByText(/Acciones Bimbo|Superaste la inflación|Rendimiento:/),
    ).not.toBeInTheDocument();
  });
});
