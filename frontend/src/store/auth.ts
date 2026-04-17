import { create } from 'zustand';

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

type State = {
  token: string | null;
  user: AuthUser | null;
  /** true tras recibir el primer evento de onAuthStateChange */
  hydrated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
  setHydrated: () => void;
};

/**
 * Token en memoria. La sesión se persiste vía Supabase (localStorage) y
 * se rehidrata en main.tsx mediante onAuthStateChange al cargar la app.
 */
export const useAuth = create<State>()((set) => ({
  token: null,
  user: null,
  hydrated: false,

  setAuth: (token, user) => set({ token, user }),
  clearAuth: () => set({ token: null, user: null }),
  setHydrated: () => set({ hydrated: true }),
}));
