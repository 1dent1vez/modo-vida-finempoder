// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/store/auth';
import Newsletter from './Newsletter';
const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  newsletterApi: mocks,
}));
vi.mock('@/api/client', () => ({ client: { patch: vi.fn() } }));
const catalog = {
  editions: [
    {
      id: 'sample',
      title: 'Muestra de prueba',
      summary: 'Resumen de prueba',
      category: 'Fugas de dinero',
      is_sample: true,
      author: 'Prueba',
      published_at: null,
    },
    {
      id: 'paid',
      title: 'Edición de pago',
      summary: 'Resumen de pago',
      category: 'Antes de contratar',
      is_sample: false,
      author: 'Prueba',
      published_at: null,
    },
  ],
  paymentsReady: true,
  price: 49,
  supportEmail: '',
};
const access = {
  hasAccess: false,
  status: 'none',
  canManage: false,
  isEditor: false,
  emailEnabled: false,
};
beforeEach(() => {
  useAuth.setState({ user: null, token: null, hydrated: true });
  vi.stubGlobal('scrollTo', vi.fn());
  mocks.get.mockImplementation(async (path: string) =>
    path === '/catalog'
      ? catalog
      : path === '/me'
        ? access
        : { ...catalog.editions[0], body: 'Cuerpo de la muestra.' },
  );
  mocks.post.mockReset();
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const show = () =>
  render(
    <MemoryRouter>
      <Newsletter />
    </MemoryRouter>,
  );
describe('Newsletter integrado', () => {
  it('preserva invitados: muestra legible y contratación mediante inicio de sesión', async () => {
    show();
    expect(
      await screen.findByRole('heading', { name: 'Billete Bajo Control' }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /Iniciar sesión para suscribirme/ }),
    ).toHaveAttribute('href', '/auth');
    expect(screen.getByText('Para suscriptores')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Leer muestra/ }));
    expect(await screen.findByText('Cuerpo de la muestra.')).toBeInTheDocument();
    expect(mocks.get).not.toHaveBeenCalledWith('/editions/paid');
  });
  it('busca ediciones por título y conserva los filtros', async () => {
    show();
    const search = await screen.findByRole('searchbox', { name: 'Buscar ediciones' });
    fireEvent.change(search, { target: { value: 'pago' } });
    expect(screen.getByText('Edición de pago')).toBeInTheDocument();
    expect(screen.queryByText('Muestra de prueba')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fugas de dinero' }));
    expect(screen.getByText('No hay ediciones que coincidan.')).toBeInTheDocument();
  });
  it('exige mayoría de edad y aceptación antes de iniciar el cobro', async () => {
    useAuth.setState({ user: { id: 'reader', email: 'test@example.com' }, token: 'test' });
    show();
    const button = await screen.findByRole('button', { name: 'Suscribirme por $49 al mes' });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Tengo 18 años o más.'));
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByLabelText(/Acepto los/));
    expect(button).toBeEnabled();
  });
  it('borra el cuerpo al cambiar de cuenta', async () => {
    show();
    fireEvent.click(await screen.findByRole('button', { name: /Leer muestra/ }));
    await screen.findByText('Cuerpo de la muestra.');
    act(() =>
      useAuth.setState({ user: { id: 'another', email: 'another@example.com' }, token: 'another' }),
    );
    await waitFor(() =>
      expect(screen.queryByText('Cuerpo de la muestra.')).not.toBeInTheDocument(),
    );
  });
  it('presenta fallos de conexión sin simular ediciones ni pagos', async () => {
    mocks.get.mockRejectedValue(new Error('offline'));
    show();
    expect(await screen.findByRole('alert')).toHaveTextContent('Revisa tu conexión');
    expect(screen.queryByText('Edición de pago')).not.toBeInTheDocument();
  });
});
