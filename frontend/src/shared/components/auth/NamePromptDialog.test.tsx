// @vitest-environment jsdom
// Onboarding de nombre post-login (F4-NOMBRE-PERFIL): aparece solo con
// sesión sin nombre y sin flag, guarda con updateUser, "Omitir" marca el
// flag para siempre y los errores de red no bloquean.
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';
import { NAME_ASKED_KEY } from '@/lib/namePrompt';
import { useAuth } from '@/store/auth';
import { NamePromptDialog } from './NamePromptDialog';

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    },
  },
}));

const updateUser = vi.mocked(supabase.auth.updateUser);

/** Resultado exitoso de updateUser; el componente solo revisa `error`. */
function mockUpdateOk() {
  updateUser.mockImplementation(async () => ({
    data: { user: { id: 'u-otp' } as never },
    error: null,
  }));
}

function sessionSinNombre() {
  useAuth.getState().setAuth('token-otp', {
    id: 'u-otp',
    email: 'otp@finempoder.com',
  });
}

beforeEach(() => {
  localStorage.clear();
  useAuth.getState().clearAuth();
  updateUser.mockReset();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  useAuth.getState().clearAuth();
});

describe('NamePromptDialog — visibilidad', () => {
  it('se muestra con sesión sin nombre y sin fe_name_asked', () => {
    sessionSinNombre();
    render(<NamePromptDialog />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: '¿Cómo te llamas?' })).toBeInTheDocument();
    expect(
      screen.getByText('Así te saludamos en la app. Puedes omitirlo si prefieres.'),
    ).toBeInTheDocument();
  });

  it('no se muestra sin sesión (invitado)', () => {
    render(<NamePromptDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con nombre (Google) no se muestra', () => {
    useAuth.getState().setAuth('token-google', {
      id: 'u-google',
      email: 'google@finempoder.com',
      name: 'Ana García',
    });
    render(<NamePromptDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con fe_name_asked marcado no se muestra', () => {
    localStorage.setItem(NAME_ASKED_KEY, '1');
    sessionSinNombre();
    render(<NamePromptDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se cierra al desloguearse sin marcar el flag', () => {
    sessionSinNombre();
    render(<NamePromptDialog />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    act(() => {
      useAuth.getState().clearAuth();
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem(NAME_ASKED_KEY)).toBeNull();
  });
});

describe('NamePromptDialog — "Omitir" y cierre', () => {
  it('"Omitir" marca fe_name_asked y no reaparece al volver a montar ni en otra sesión', () => {
    sessionSinNombre();
    const first = render(<NamePromptDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Omitir' }));

    expect(localStorage.getItem(NAME_ASKED_KEY)).toBe('1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Mismo montaje vivo: sigue cerrado.
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Re-montaje en la misma sesión.
    first.unmount();
    render(<NamePromptDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Otra sesión posterior sin nombre: el flag persiste en localStorage.
    cleanup();
    useAuth.getState().clearAuth();
    sessionSinNombre();
    render(<NamePromptDialog />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('la X cierra y marca el flag igual que "Omitir"', () => {
    sessionSinNombre();
    render(<NamePromptDialog />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(localStorage.getItem(NAME_ASKED_KEY)).toBe('1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('NamePromptDialog — validación y guardado', () => {
  it('deshabilita Guardar con input vacío, solo espacios, emojis o caracteres raros', () => {
    sessionSinNombre();
    render(<NamePromptDialog />);
    const save = () => screen.getByRole('button', { name: 'Guardar' });

    expect(save()).toBeDisabled(); // vacío

    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: '   ' } });
    expect(save()).toBeDisabled(); // solo espacios

    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana 😀' } });
    expect(save()).toBeDisabled(); // emojis
    expect(
      screen.getByText('Usa solo letras, espacios, guiones y apóstrofos.'),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana123' } });
    expect(save()).toBeDisabled(); // caracteres raros

    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana' } });
    expect(save()).toBeEnabled();
  });

  it('Guarda con nombre válido: llama updateUser con el nombre recortado y cierra', async () => {
    mockUpdateOk();
    sessionSinNombre();
    render(<NamePromptDialog />);

    fireEvent.change(screen.getByLabelText('Tu nombre'), {
      target: { value: '  Ana García  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(updateUser).toHaveBeenCalledWith({ data: { name: 'Ana García' } });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(localStorage.getItem(NAME_ASKED_KEY)).toBe('1');
  });

  it('si updateUser falla muestra el error suave, el diálogo sigue y se puede reintentar', async () => {
    updateUser.mockRejectedValue(new Error('red'));
    sessionSinNombre();
    render(<NamePromptDialog />);

    fireEvent.change(screen.getByLabelText('Tu nombre'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => {
      expect(
        screen.getByText('No pudimos guardar tu nombre. Inténtalo de nuevo.'),
      ).toBeInTheDocument();
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled();

    // Reintento con éxito.
    mockUpdateOk();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
