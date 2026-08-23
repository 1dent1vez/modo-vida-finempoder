// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../../store/auth';

const { supabaseMock } = vi.hoisted(() => ({
  supabaseMock: {
    auth: {
      signInWithOtp: vi.fn(),
      verifyOtp: vi.fn(),
      signInWithOAuth: vi.fn(),
    },
  },
}));

vi.mock('@/lib/supabase', () => ({ supabase: supabaseMock }));

import AuthScreen from './AuthScreen';

function renderScreen() {
  return render(
    <MemoryRouter>
      <AuthScreen />
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuth.getState().clearAuth();
  useAuth.setState({ hydrated: false });
});

afterEach(() => cleanup());

describe('AuthScreen — flujo email / OTP', () => {
  it('envía el código OTP con el email y shouldCreateUser', async () => {
    supabaseMock.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    renderScreen();

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'alumna@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));

    await waitFor(() => {
      expect(supabaseMock.auth.signInWithOtp).toHaveBeenCalledWith({
        email: 'alumna@test.com',
        options: { shouldCreateUser: true },
      });
    });
  });

  it('verifica el código OTP de 6 dígitos', async () => {
    supabaseMock.auth.signInWithOtp.mockResolvedValue({ data: {}, error: null });
    supabaseMock.auth.verifyOtp.mockResolvedValue({ data: { session: {} }, error: null });
    renderScreen();

    fireEvent.change(screen.getByLabelText('Correo electrónico'), {
      target: { value: 'alumna@test.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar código' }));

    const codeInput = await screen.findByLabelText('Código de 6 dígitos');
    fireEvent.change(codeInput, { target: { value: '123456' } });
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    await waitFor(() => {
      expect(supabaseMock.auth.verifyOtp).toHaveBeenCalledWith({
        email: 'alumna@test.com',
        token: '123456',
        type: 'email',
      });
    });
  });
});
