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
import L11 from './L11';

function renderL11() {
  return render(
    <MemoryRouter>
      <L11 />
    </MemoryRouter>,
  );
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
    lessonId: 'L10',
    completed: true,
    completedAt: new Date().toISOString(),
  });
});

afterEach(() => {
  cleanup();
});

describe('L11 presupuesto — tutorial con pasos verificables', () => {
  it('no avanza sin entrada válida y persiste las opciones al avanzar', async () => {
    renderL11();
    fireEvent.click(await screen.findByRole('button', { name: /Comenzar tutorial/ }));

    // Paso 1: herramientas — Siguiente deshabilitado sin selección.
    let siguiente = await screen.findByRole('button', { name: 'Siguiente →' });
    expect(siguiente).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Google Sheets con plantilla/ }));
    siguiente = screen.getByRole('button', { name: 'Siguiente →' });
    expect(siguiente).toBeEnabled();
    fireEvent.click(siguiente);

    // Paso 2: método — Siguiente deshabilitado con texto vacío o solo espacios.
    const input = await screen.findByLabelText('¿Qué app usarás primero?');
    const siguienteMetodo = screen.getByRole('button', { name: 'Siguiente →' });
    expect(siguienteMetodo).toBeDisabled();
    fireEvent.change(input, { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeDisabled();
    fireEvent.change(input, { target: { value: '  Google Sheets  ' } });
    const siguienteMetodo2 = screen.getByRole('button', { name: 'Siguiente →' });
    expect(siguienteMetodo2).toBeEnabled();
    fireEvent.click(siguienteMetodo2);

    // Paso 3: señal — Terminar deshabilitado hasta elegir día y hora.
    const terminar = await screen.findByRole('button', { name: 'Terminar tutorial →' });
    expect(terminar).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Día de la semana'), { target: { value: 'Sábado' } });
    fireEvent.change(screen.getByLabelText('Hora'), { target: { value: '8:00 PM' } });
    expect(terminar).toBeEnabled();
    fireEvent.click(terminar);

    await waitFor(() => expect(screen.getByText('3/3 pasos preparados')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));

    // La cadena de persistencia del shell sigue escribiendo en IndexedDB tras
    // completar; esperarla aquí evita que un pendiente contamine el siguiente
    // test (que arranca limpiando la base).
    await waitFor(async () => {
      const row = await db.lessonProgress
        .where({ moduleId: 'presupuesto', lessonId: 'L11' })
        .first();
      expect(row?.completed).toBe(true);
    });

    const row = await db.userLessonData.where('key').equals('l11_opciones').first();
    const data = row?.data as {
      herramientas: string[];
      metodo: string;
      senal: { dia: string; hora: string };
    };
    expect(data.herramientas).toEqual(['sheets']);
    expect(data.metodo).toBe('Google Sheets');
    expect(data.senal).toEqual({ dia: 'Sábado', hora: '8:00 PM' });
  });

  it('sin entrada válida no avanza de paso', async () => {
    renderL11();
    fireEvent.click(await screen.findByRole('button', { name: /Comenzar tutorial/ }));

    const siguiente = await screen.findByRole('button', { name: 'Siguiente →' });
    expect(siguiente).toBeDisabled();
    fireEvent.click(siguiente);
    expect(screen.getByText(/Toca al menos una herramienta/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Google Sheets con plantilla/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
    const input = await screen.findByLabelText('¿Qué app usarás primero?');
    fireEvent.change(input, { target: { value: '   ' } });
    expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeDisabled();
    expect(screen.getByText(/¿Qué app usarás primero?/)).toBeInTheDocument();
  });

  it('rehidrata las opciones guardadas al volver a montar', async () => {
    await lessonDataRepository.save('presupuesto', 'l11_opciones', {
      herramientas: ['sheets', 'finempoder'],
      metodo: 'Google Sheets',
      senal: { dia: 'Lunes', hora: '10:00 AM' },
      updatedAt: new Date().toISOString(),
    });
    renderL11();
    fireEvent.click(await screen.findByRole('button', { name: /Comenzar tutorial/ }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Siguiente →' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Terminar tutorial →' })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Terminar tutorial →' }));

    await waitFor(() => expect(screen.getByText('3/3 pasos preparados')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y terminar' }));
    await waitFor(() => expect(screen.getByText(/plan quedó guardado/)).toBeInTheDocument());
  });
});
