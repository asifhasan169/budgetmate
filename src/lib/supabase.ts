import { createClient } from '@supabase/supabase-js';

const meta = import.meta as any;
const supabaseUrl = meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = meta.env?.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase configuration missing: Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.'
  );
}

// Fallback dummy values to prevent crash when env vars are not set during initial setup
const validUrl = supabaseUrl || 'https://placeholder-project.supabase.co';
const validKey = supabaseAnonKey || 'placeholder-anon-key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const isSupabaseConfigured = (): boolean => {
  const url = meta.env?.VITE_SUPABASE_URL || '';
  const key = meta.env?.VITE_SUPABASE_ANON_KEY || '';
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder-project') &&
    !key.includes('placeholder-anon-key')
  );
};

