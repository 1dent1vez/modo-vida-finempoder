import { useMutation } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/auth';

type LoginDTO = { email: string; password: string };

export function useLogin() {
  const setAuth = useAuth((s) => s.setAuth);

  return useMutation({
    mutationFn: async ({ email, password }: LoginDTO) => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) throw new Error('Credenciales inválidas');

      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', data.user.id)
        .single();

      return {
        token: data.session.access_token,
        user: { id: data.user.id, email: data.user.email ?? '', name: profile?.name ?? undefined },
      };
    },
    onSuccess: ({ token, user }) => {
      setAuth(token, user);
    },
  });
}
