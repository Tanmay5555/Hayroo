/**
 * Supabase Client for ApexBazaar Front-End
 * Provides real-time subscriptions for order tracking status updates,
 * inventory alerts, and public catalog change streams.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xnbxncwqwqjegsubibpj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuYnhuY3dxd3FqZWdzdWJpYnBqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ0OTEyMTksImV4cCI6MjExMDA2NzIxOX0._jLyCuhQ0l2xV2eThBfKLLbqjCIhRPigaDyJkvYNces';

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

