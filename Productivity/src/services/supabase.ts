import { createClient, SupabaseClient, type Session, type User as SupaUser } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  ''
);

// Fallback to official project URL if not provided
const supabaseUrl = rawUrl || 'https://etnfwwmgjqydfxhztntd.supabase.co';

// Check if valid client key is provided
export const isSupabaseConfigured = Boolean(
  rawKey &&
  rawKey.length > 20 &&
  !rawKey.includes('YOUR_SUPABASE')
);

// If not configured, use safe placeholder JWT so createClient does not crash Vite bundling
const effectiveKey = isSupabaseConfigured
  ? rawKey
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder_key';

export const supabase: SupabaseClient = createClient(supabaseUrl, effectiveKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
}

export type { Session, SupaUser };
