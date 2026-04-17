// frontend/src/api/client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuth } from '../store/auth';
import { supabase } from '../lib/supabase';

// Base URL: proxy en dev, env en prod
const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
if (import.meta.env.MODE !== 'development' && !apiUrl) {
  throw new Error('[api] VITE_API_URL es obligatoria en producción');
}
const baseURL = import.meta.env.MODE === 'development' ? '/api' : apiUrl!;

const client: AxiosInstance = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Añade el token JWT a cada petición
client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuth.getState().token;
  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo centralizado de errores
client.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Limpia la sesión local sin llamar a la API de Supabase
      supabase.auth.signOut({ scope: 'local' });
    } else if ((status ?? 0) >= 500) {
      console.error('[server] Error 5xx del servidor');
    }

    return Promise.reject(error);
  }
);

export default client;
export { client };
