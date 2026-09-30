// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useAuth } from '@/store/auth';
import AdminConsole from './AdminConsole';

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/api/client', () => ({ client: mocks }));
const overview = {
  metrics: { accounts: 2, completedLessons: 14, newsletterMembers: 1, draft: 1, approved: 0, scheduled: 0, sending: 0, failed: 0 },
  editions: [{ id: 'one', title: 'Edición de prueba', status: 'draft', created_at: '2026-09-30T00:00:00Z', scheduled_at: null, delivery_status: null, delivery_error: null }],
  modules: [{ id: 'ahorro', lessons: 15 }],
  services: { api: true, newsletter: true, payments: false, email: false, editorialAi: false, publicationJob: false },
};

beforeEach(() => {
  useAuth.setState({ user: { id: 'admin', email: 'admin@example.com' }, token: 'test', hydrated: true });
  mocks.get.mockImplementation(async (path: string) => {
    if (path === '/admin/me') return { data: { role: 'admin' } };
    if (path === '/admin/users') return { data: { page: 1, perPage: 25, total: 1, users: [{ id: 'admin', email: 'admin@example.com', name: 'Admin', role: 'admin', createdAt: '2026-09-01T00:00:00Z', lastSignInAt: null, emailConfirmed: true }] } };
    return { data: overview };
  });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });

it('muestra datos reales por sección y enlaza al editor', async () => {
  render(<MemoryRouter><AdminConsole /></MemoryRouter>);
  expect(await screen.findByText('Edición de prueba')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Abrir editorial/ })).toHaveAttribute('href', '/app/admin/newsletter');
  fireEvent.click(screen.getByRole('tab', { name: 'Usuarios' }));
  expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('tab', { name: 'Operación' }));
  expect(await screen.findByText('Configuración operativa')).toBeInTheDocument();
  expect(screen.getAllByText('No configurado')).toHaveLength(4);
  expect(mocks.get).toHaveBeenCalledWith('/admin/users', expect.objectContaining({ params: { page: 1 } }));
});

it('no muestra datos cuando el servidor rechaza el rol', async () => {
  mocks.get.mockRejectedValue({ response: { status: 403 } });
  render(<MemoryRouter><AdminConsole /></MemoryRouter>);
  expect(await screen.findByText('Esta cuenta no tiene el rol de administración.')).toBeInTheDocument();
  expect(screen.queryByText('Edición de prueba')).not.toBeInTheDocument();
  await waitFor(() => expect(mocks.get).toHaveBeenCalledTimes(1));
});
