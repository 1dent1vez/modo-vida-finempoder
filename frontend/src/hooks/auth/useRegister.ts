// frontend/src/hooks/auth/useRegister.ts
import { useMutation } from '@tanstack/react-query';
import authApi, { type RegisterDTO } from '../../api/auth/auth.api';
import { useAuth } from '../../store/auth';
import { supabase } from '../../lib/supabase';

export function useRegister() {
  const setAuth = useAuth((s) => s.setAuth);

  return useMutation({
    mutationFn: (dto: RegisterDTO) => authApi.register(dto),
    onSuccess: async ({ token, refreshToken, user }) => {
      if (token && refreshToken) {
        // Persiste la sesión en localStorage para que sobreviva recargas
        await supabase.auth.setSession({ access_token: token, refresh_token: refreshToken });
      }
      if (token) {
        setAuth(token, {
          id: user._id,
          email: user.email,
          name: user.name ?? undefined,
        });
      }
    },
  });
}
