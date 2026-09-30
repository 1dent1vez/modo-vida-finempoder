// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useAuth } from '@/store/auth';
import NewsletterAdmin from './NewsletterAdmin';

const mocks = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('./api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./api')>()),
  newsletterApi: mocks,
}));
vi.mock('@/api/client', () => ({ client: { put: vi.fn() } }));

beforeEach(() => {
  useAuth.setState({
    user: { id: 'editor', email: 'editor@example.com' },
    token: 'test',
    hydrated: true,
  });
  mocks.get.mockImplementation(async (path: string) => {
    if (path === '/me') return { isEditor: true };
    return [];
  });
  mocks.post.mockResolvedValue({
    title: 'Cómo leer el costo de una tarjeta',
    summary: 'Una guía para entender cargos antes de elegir una tarjeta de crédito.',
    body: 'Antes de contratar, revisa el costo total y las condiciones vigentes. '.repeat(8),
    category: 'Antes de contratar',
    sources: [{ title: 'CONDUSEF', url: 'https://www.condusef.gob.mx/' }],
    review: { passed: false, issues: ['Confirmar el ejemplo con la fuente original.'] },
    researchedAt: '2026-09-30T00:00:00Z',
  });
});
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('genera un borrador editable con fuentes y alertas sin guardarlo automáticamente', async () => {
  render(
    <MemoryRouter>
      <NewsletterAdmin />
    </MemoryRouter>,
  );
  const topic = await screen.findByLabelText('Tema de investigación');
  fireEvent.change(topic, { target: { value: 'Cómo comparar el costo de una tarjeta' } });
  fireEvent.click(screen.getByRole('button', { name: 'Investigar y preparar borrador' }));
  await waitFor(() =>
    expect(screen.getByLabelText('Título')).toHaveValue('Cómo leer el costo de una tarjeta'),
  );
  expect(screen.getByText('Confirmar el ejemplo con la fuente original.')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'CONDUSEF' })).toHaveAttribute(
    'href',
    'https://www.condusef.gob.mx/',
  );
  expect(screen.getByLabelText('Responsable editorial')).toHaveValue('');
  expect(mocks.post).toHaveBeenCalledWith('/admin/ai-draft', {
    topic: 'Cómo comparar el costo de una tarjeta',
    angle: '',
    category: 'Antes de contratar',
  });
  expect(mocks.post).toHaveBeenCalledTimes(1);
});
