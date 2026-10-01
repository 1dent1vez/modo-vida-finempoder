// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import FinniAssistant from '../../shared/components/finni/FinniAssistant';
import NotFound from '../../pages/errors/NotFound';
afterEach(cleanup);
describe('Finni y recuperación de rutas', () => {
  it('espera a ser solicitado, permite cerrar con Escape y vuelve ante un nuevo evento', () => {
    const advice = { title: 'Una pista', text: 'Revisa el monto y la frecuencia.' };
    const view = render(<FinniAssistant advice={advice} cue={null} />);
    expect(screen.queryByRole('status')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Pedir una pista a Finni' }));
    expect(screen.getByRole('status').textContent).toContain(advice.text);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('status')).toBeNull();
    view.rerender(<FinniAssistant advice={advice} cue="respuesta-1" />);
    expect(screen.getByRole('status')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar consejo de Finni' }));
    view.rerender(<FinniAssistant advice={advice} cue="respuesta-1" />);
    expect(screen.queryByRole('status')).toBeNull();
    view.rerender(<FinniAssistant advice={advice} cue="respuesta-2" />);
    expect(screen.getByRole('status')).toBeTruthy();
  });
  it('la página 404 ofrece una ruta segura sin iniciar sesión', () => {
    render(<NotFound homeHref="/piloto.html" homeLabel="Volver al piloto" />);
    expect(screen.getByRole('heading', { name: /Nos salimos/ })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Volver al piloto' }).getAttribute('href')).toBe(
      '/piloto.html',
    );
  });
});
