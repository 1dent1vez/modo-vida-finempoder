import { supabase } from '../lib/supabase.js';
import { httpError } from './providers.js';
import type { Membership, EditionInput } from './core.js';

export type Member = Membership & { user_id: string; email: string; email_enabled: boolean; checkout_id: string | null; };
export type Edition = EditionInput & { id: string; status: string; version: number; approved_at: string | null;
  scheduled_at: string | null; published_at: string | null; broadcast_id: string | null; delivery_status: string | null; delivery_error: string | null; };
export function checked<T>(result: { data: T; error: unknown }): T {
  if (result.error) throw httpError(503, 'El newsletter no está disponible en este momento. Inténtalo más tarde.');
  return result.data;
}
export async function member(id: string): Promise<Member | null> {
  return checked(await supabase.from('newsletter_memberships').select('*').eq('user_id', id).maybeSingle());
}
export async function edition(id: string): Promise<Edition> {
  const row = checked(await supabase.from('newsletter_editions').select('*').eq('id', id).maybeSingle());
  if (!row) throw httpError(404, 'No encontramos esta edición.');
  return row;
}
export const META = 'id,title,summary,category,author,is_sample,published_at';
