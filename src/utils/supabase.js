/**
 * Supabase Client for ApexBazaar Front-End
 * Provides real-time subscriptions for order tracking status updates,
 * inventory alerts, and public catalog change streams.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

let supabaseClient;

try {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} catch (err) {
  console.warn('⚠️ Supabase client fallback initialized:', err.message);
  supabaseClient = {
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
    }),
  };
}

export const supabase = supabaseClient;
export default supabase;

