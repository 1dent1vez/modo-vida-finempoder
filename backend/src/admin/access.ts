import { supabase } from '../lib/supabase.js';
import { isEditor } from '../newsletter/providers.js';

export async function canEditNewsletter(userId: string): Promise<boolean> {
  if (isEditor(userId)) return true;
  const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).maybeSingle();
  if (error) return false;
  return data?.role === 'admin';
}
