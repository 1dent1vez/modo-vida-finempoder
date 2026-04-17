import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('[supabase] VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY son obligatorias');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
