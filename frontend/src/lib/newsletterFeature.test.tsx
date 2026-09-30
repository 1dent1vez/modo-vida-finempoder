// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import { AppNavbar } from '@/components/layout/AppNavbar';
import { newsletterEnabled } from './newsletterFeature';

afterEach(() => { cleanup(); vi.unstubAllEnvs(); });

it('parte apagado en producción si no se configura la bandera', () => {
  vi.stubEnv('VITE_NEWSLETTER_ENABLED', undefined);
  vi.stubEnv('PROD', true);
  expect(newsletterEnabled()).toBe(false);
});

it('oculta el newsletter del menú cuando el release lo desactiva', () => {
  vi.stubEnv('VITE_NEWSLETTER_ENABLED', 'false');
  expect(newsletterEnabled()).toBe(false);
  render(<MemoryRouter initialEntries={['/app']}><AppNavbar /></MemoryRouter>);
  expect(screen.queryByRole('button', { name: 'Billete' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Inicio' })).toBeInTheDocument();
});

it('permite habilitar la navegación para QA una vez configurado el módulo', () => {
  vi.stubEnv('VITE_NEWSLETTER_ENABLED', 'true');
  expect(newsletterEnabled()).toBe(true);
  render(<MemoryRouter initialEntries={['/app']}><AppNavbar /></MemoryRouter>);
  expect(screen.getByRole('button', { name: 'Billete' })).toBeInTheDocument();
});
