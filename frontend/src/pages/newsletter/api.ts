import { client } from '@/api/client';

export type Edition = {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  is_sample: boolean;
  published_at: string | null;
  body?: string;
  sources?: { title: string; url: string }[];
  status?: string;
  version?: number;
  scheduled_at?: string | null;
  delivery_status?: string | null;
  delivery_error?: string | null;
};
export type Membership = {
  hasAccess: boolean;
  accessUntil: string | null;
  isPilot: boolean;
  inGrace: boolean;
  status: string;
  cancelAtPeriodEnd: boolean;
  emailEnabled: boolean;
  canManage: boolean;
  canSubscribe?: boolean;
  isEditor: boolean;
};
export type Catalog = {
  editions: Edition[];
  paymentsReady: boolean;
  price: number;
  supportEmail: string;
};
export type GeneratedDraft = {
  title: string;
  summary: string;
  body: string;
  category: string;
  sources: { title: string; url: string }[];
  review: { passed: boolean; issues: string[] };
  researchedAt: string;
};
export const newsletterApi = {
  get: async <T>(path: string, signal?: AbortSignal) =>
    (await client.get<T>(`/newsletter${path}`, { signal })).data,
  post: async <T>(path: string, body: unknown = {}) =>
    (await client.post<T>(`/newsletter${path}`, body)).data,
};
export function errorMessage(error: unknown): string {
  const e = error as { response?: { data?: { error?: string } }; message?: string };
  return e.response?.data?.error ?? 'No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.';
}
export function dateLabel(value: string | null) {
  return value
    ? new Intl.DateTimeFormat('es-MX', {
        dateStyle: 'medium',
        timeZone: 'America/Mexico_City',
      }).format(new Date(value))
    : '';
}
