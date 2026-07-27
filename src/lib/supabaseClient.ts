/**
 * Supabase Client Configuration & Integration Adapter
 * 
 * When backend is ready to connect:
 * 1. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or environment
 * 2. Set VITE_USE_SUPABASE=true
 */

const meta = import.meta as any;

export const isSupabaseConfigured = (): boolean => {
  const url = meta.env?.VITE_SUPABASE_URL;
  const key = meta.env?.VITE_SUPABASE_ANON_KEY;
  const useBackend = meta.env?.VITE_USE_SUPABASE === 'true';
  return Boolean(useBackend && url && key);
};

export const SUPABASE_CONFIG = {
  url: meta.env?.VITE_SUPABASE_URL || 'https://your-supabase-project.supabase.co',
  anonKey: meta.env?.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here',
  isConfigured: isSupabaseConfigured()
};
