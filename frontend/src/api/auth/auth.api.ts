import type { AxiosError } from 'axios';
import client from '../client';

export type RegisterDTO = {
  name: string;
  career: string;
  age: number;
  email: string;
  phone: string;
  password: string;
  acceptTerms: boolean;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type AuthUser = {
  _id: string;
  email: string;
  name?: string;
};

export type AuthResponse = {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser;
};

function extractMessage(err: unknown, fallback: string): never {
  const msg = (err as AxiosError<{ error: string }>).response?.data?.error;
  throw new Error(msg ?? fallback);
}

const authApi = {
  async register(payload: RegisterDTO): Promise<AuthResponse> {
    try {
      const { data } = await client.post<AuthResponse>('/auth/register', payload);
      return data;
    } catch (err) {
      extractMessage(err, 'No se pudo crear la cuenta');
    }
  },
  async login(payload: LoginDTO): Promise<AuthResponse> {
    try {
      const { data } = await client.post<AuthResponse>('/auth/login', payload);
      return data;
    } catch (err) {
      extractMessage(err, 'Error al iniciar sesión');
    }
  },
};

export default authApi;
