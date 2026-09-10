// @vitest-environment jsdom
// fake-indexeddb/auto MUST be first — patches global indexedDB before Dexie instantiates
import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as jestDomMatchers from '@testing-library/jest-dom/matchers';

expect.extend(jestDomMatchers);
import { cleanup, configure, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Bajo carga (suite completa en paralelo) fake-indexeddb puede tardar más que
// el timeout por defecto de 1s; se amplía para evitar flakes de timing.
configure({ asyncUtilTimeout: 8000 });
vi.setConfig({ testTimeout: 15000 });

vi.mock('canvas-confetti', () => ({ default: vi.fn() }));

import { db } from '../../../../db/finempoderDb';
import { lessonDataRepository } from '../../../../db/lessonData.repository';
import { useAuth } from '../../../../store/auth';
import { useLessons } from '../../../../store/lessons';
import { useProgress } from '../../../../store/progress';
import L15 from './L15';

const COMPROMISOS = [
  'No gastaré más de $50 en cafetería esta semana',
  'Registraré mis gastos cada noche antes de dormir',
  'Apartaré $200 el día que llegue mi quincena',
];

async function seedPresupuesto() {
  await lessonDataRepository.save('presupuesto', 'l12_budget', {
    totalIngresos: 10000,
    totalGastos: 8000,
    balance: 2000,
  });
}

function renderL15() {
  return render(
    <MemoryRouter>
      <L15 />
    </MemoryRouter>,
  );
}

async function irAParte3() {
  fireEvent.click(await screen.findByRole('button', { name: /Empezar el reto/ }));
  fireEvent.click(await screen.findByRole('button', { name: /Parte 2: Compromisos/ }));
  const textareas = await screen.findAllByRole('textbox');
  COMPROMISOS.forEach((c, i) => fireEvent.change(textareas[i], { target: { value: c } }));
  fireEvent.click(await screen.findByRole('button', { name: /Parte 3: Tu señal semanal/ }));
  await screen.findByLabelText('Día de la semana');
}

async function elegirSenal(dia: string, hora: string) {
  fireEvent.change(await screen.findByLabelText('Día de la semana'), { target: { value: dia } });
  fireEvent.change(await screen.findByLabelText('Hora'), { target: { value: hora } });
}

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  useAuth.getState().clearAuth();
  useLessons.getState().reset();
  useProgress.getState().reset();
  await Promise.all(db.tables.map((t) => t.clear()));
  await db.lessonProgress.add({
    userId: 'local',
    moduleId: 'presupuesto',
    lessonId: 'L14',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});

afterEach(() => {
  cleanup();
});

describe('L15 — señal de revisión semanal honesta', () => {
  it('persiste en l15_senal_semanal y el resumen muestra "Tu señal: ..." leído de vuelta', async () => {
    await seedPresupuesto();
    renderL15();
    await irAParte3();
    await elegirSenal('Sábado', '8:00 PM');

    fireEvent.click(screen.getByRole('button', { name: /Guardar y ver resumen/ }));

    await waitFor(() =>
      expect(
        screen.getByText(/Tu señal: Sábado 8:00 PM · Revisarás tu presupuesto/),
      ).toBeInTheDocument(),
    );

    const row = await db.userLessonData.where('key').equals('l15_senal_semanal').first();
    expect(row?.data).toMatchObject({ dia: 'Sábado', hora: '8:00 PM' });
    expect(row?.updatedAt).toBeTruthy();

    // Cero promesas falsas en el resumen.
    expect(screen.queryByText(/configurado/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/avisarem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Recordatorio/i)).not.toBeInTheDocument();
  });

  it('el resumen lee la señal persistida desde la base al montar', async () => {
    await seedPresupuesto();
    await lessonDataRepository.save('presupuesto', 'l15_senal_semanal', {
      dia: 'Lunes',
      hora: '10:00 AM',
      updatedAt: new Date().toISOString(),
    });
    renderL15();
    await irAParte3();

    // Los selects llegan precargados desde la base y el guardado la reescribe.
    fireEvent.click(screen.getByRole('button', { name: /Guardar y ver resumen/ }));

    await waitFor(() =>
      expect(
        screen.getByText(/Tu señal: Lunes 10:00 AM · Revisarás tu presupuesto/),
      ).toBeInTheDocument(),
    );
  });

  it('si el guardado falla, no completa y muestra mensaje', async () => {
    await seedPresupuesto();
    renderL15();
    await irAParte3();
    await elegirSenal('Sábado', '8:00 PM');
    vi.spyOn(lessonDataRepository, 'save').mockRejectedValue(new Error('db fail'));

    fireEvent.click(screen.getByRole('button', { name: /Guardar y ver resumen/ }));

    await waitFor(() =>
      expect(screen.getByText(/No pudimos guardar tu señal/)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/Resumen del reto/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Presupuesto Pro/)).not.toBeInTheDocument();
  });

  it('desbloquea el badge solo con la señal guardada y persistida', async () => {
    await seedPresupuesto();
    renderL15();
    await irAParte3();
    await elegirSenal('Domingo', '12:00 PM');
    fireEvent.click(screen.getByRole('button', { name: /Guardar y ver resumen/ }));

    await waitFor(() => expect(screen.getByText(/Tu señal: Domingo 12:00 PM/)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Desbloquear Presupuesto Pro/ }));

    await waitFor(() => expect(screen.getByText('Presupuesto Pro')).toBeInTheDocument());
    const senal = await db.userLessonData.where('key').equals('l15_senal_semanal').first();
    const compromisos = await db.userLessonData.where('key').equals('l15_compromisos').first();
    expect(senal?.data).toMatchObject({ dia: 'Domingo', hora: '12:00 PM' });
    expect(compromisos?.data).toMatchObject({ compromisos: COMPROMISOS });
  });
});
