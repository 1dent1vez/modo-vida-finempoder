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
import L08 from './L08';
import L09 from './L09';
import L10 from './L10';
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
describe('Inversión L08-L10', () => {
  it('L08 guarda un mapa revisable sin recomendar instrumentos', async () => {
    await seed('L07');
    render(
      <MemoryRouter>
        <L08 />
      </MemoryRouter>,
    );
    for (const n of ['Capacidad', 'Disposición', 'Plazo', 'Experiencia']) await c(new RegExp(n));
    await c('Aplicar criterios');
    await c('No sé cómo reaccionaría');
    fireEvent.change(await screen.findByPlaceholderText(/Escribe tu criterio/), {
      target: { value: 'Revisaría mi plazo y capacidad' },
    });
    await c('Comprobar decisiones');
    await c('No; solo aporta información para evaluar');
    await c('Pueden ser distintas');
    await c('Sí, con metas y circunstancias');
    await c('Revisar aprendizaje');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l08_risk_map')).not.toBeNull(),
    );
    expect(
      screen.queryByText(/Instrumentos recomendados|Perfil: agresivo/),
    ).not.toBeInTheDocument();
  });
  it('L09 explica concentración sin tasas ni regla de edad', async () => {
    await seed('L08');
    render(
      <MemoryRouter>
        <L09 />
      </MemoryRouter>,
    );
    for (const n of ['Emisor', 'Sector', 'Tipo de activo', 'Región y moneda'])
      await c(new RegExp(n));
    await c('Aplicar criterios');
    await c('Conserva concentración sectorial');
    fireEvent.change(await screen.findByPlaceholderText(/Escribe tu criterio/), {
      target: { value: 'Revisaría riesgos compartidos' },
    });
    await c('Comprobar decisiones');
    await c('No; distribuye exposiciones, pero conserva riesgos');
    await c('No; importa qué riesgos comparten');
    await c('No; requiere contexto personal');
    await c('Revisar aprendizaje');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l09_diversification')).not.toBeNull(),
    );
    expect(screen.queryByText(/100 menos tu edad|Rendimiento estimado/)).not.toBeInTheDocument();
  });
  it('L10 guarda un protocolo verificable', async () => {
    await seed('L09');
    render(
      <MemoryRouter>
        <L10 />
      </MemoryRouter>,
    );
    for (const n of [
      'Promesa extraordinaria',
      'Presión',
      'Opacidad',
      'Identidad dudosa',
      'Pago por reclutar',
    ])
      await c(new RegExp(n));
    await c('Aplicar criterios');
    await c('Pausar y verificar identidad, documentos y registro');
    fireEvent.change(await screen.findByPlaceholderText(/Escribe tu criterio/), {
      target: { value: 'Guardaría evidencia y verificaría registros' },
    });
    await c('Comprobar decisiones');
    await c('No');
    await c('Documentos y registros oficiales vigentes');
    await c('Detener pagos, guardar evidencia y buscar canales oficiales');
    await c('Revisar aprendizaje');
    await c('Guardar y terminar');
    await waitFor(async () =>
      expect(await lessonDataRepository.load('inversion', 'l10_verification')).not.toBeNull(),
    );
    expect(screen.queryByText(/800-999|CNBV.gob.mx|20% mensual/)).not.toBeInTheDocument();
  });
});
