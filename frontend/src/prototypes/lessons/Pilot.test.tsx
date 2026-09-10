// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import Pilot from './Pilot';
import { incomeItems, initialState, restore, STORAGE_KEY } from './model';

beforeEach(() => localStorage.clear());
afterEach(cleanup);
describe('Piloto de lecciones', () => {
  it('permite corregir, completar y recuperar las seis clasificaciones sin perder respuestas', () => {
    const view = render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /Ingreso variable/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
    expect(screen.getByText('Finni · Revisa una pista')).toBeTruthy();
    for (let i = 0; i < incomeItems.length; i++) {
      fireEvent.click(
        screen.getByRole('button', {
          name: incomeItems[i].category === 'fijo' ? /Ingreso fijo/ : /Ingreso variable/,
        }),
      );
      fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }));
      fireEvent.click(
        screen.getByRole('button', {
          name: i === 5 ? 'Terminar clasificación' : 'Siguiente ingreso',
        }),
      );
    }
    expect(screen.getByText('Sabes qué ingresos son constantes.')).toBeTruthy();
    view.unmount();
    render(<Pilot />);
    expect(screen.getByText('Sabes qué ingresos son constantes.')).toBeTruthy();
    expect(restore(localStorage.getItem(STORAGE_KEY))?.classified).toHaveLength(6);
  }, 15_000);
  it('exige cubrir básicos y entender de dónde viene el ahorro', () => {
    render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /Experimenta/ }));
    expect(
      (screen.getByRole('button', { name: 'Revisar mi reparto' }) as HTMLButtonElement).disabled,
    ).toBe(true);
    fireEvent.change(screen.getByLabelText('Gustos'), { target: { value: '1500' } });
    fireEvent.blur(screen.getByLabelText('Gustos'));
    fireEvent.click(screen.getByRole('button', { name: 'Revisar mi reparto' }));
    fireEvent.click(screen.getByLabelText('De recibir un ingreso nuevo'));
    expect(
      (screen.getByRole('button', { name: 'Guardar este aprendizaje' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByLabelText('De redistribuir el mismo ingreso'));
    fireEvent.click(screen.getByRole('button', { name: 'Guardar este aprendizaje' }));
    expect(screen.getByText('Encontraste $1,500 para ahorrar.')).toBeTruthy();
  });
  it('permite explorar otra consecuencia y conserva solo las decisiones confirmadas', () => {
    render(<Pilot />);
    fireEvent.click(screen.getByRole('button', { name: /Decide/ }));
    fireEvent.click(screen.getByRole('radio', { name: /Pagar con crédito/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver consecuencia' }));
    expect(screen.getByText('$800 por pagar')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Explorar otra opción' }));
    fireEvent.click(screen.getByRole('radio', { name: /Usar \$800 de las salidas/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Ver consecuencia' }));
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente caso' }));
    expect(restore(localStorage.getItem(STORAGE_KEY))?.decisions).toEqual([0]);
    expect(screen.getByText('Este mes llegaron menos encargos.')).toBeTruthy();
  });
  it('normaliza también el valor visible cuando el límite no cambia', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...initialState(), activity: 'experimenta', needs: 2500, wants: 3000 }),
    );
    render(<Pilot />);
    const needs = screen.getByLabelText('Necesidades') as HTMLInputElement;
    fireEvent.change(needs, { target: { value: '100' } });
    fireEvent.blur(needs);
    expect(needs.value).toBe('2500');
    const wants = screen.getByLabelText('Gustos') as HTMLInputElement;
    fireEvent.change(wants, { target: { value: '9999' } });
    fireEvent.blur(wants);
    expect(wants.value).toBe('3000');
  });
  it('rechaza recuperación corrupta y datos fuera de rango', () => {
    expect(restore('{')).toBeNull();
    expect(restore(JSON.stringify({ ...initialState(), needs: -1 }))).toBeNull();
    expect(restore(JSON.stringify({ ...initialState(), revealed: true, choice: null }))).toBeNull();
    expect(restore(JSON.stringify(initialState()))).toEqual(initialState());
  });
});
