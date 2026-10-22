import { createClient, SupabaseClient, type Session, type User as SupaUser } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const rawKey = (
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ||
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
  ''
);

// Default fallback credentials for project etnfwwmgjqydfxhztntd
const defaultUrl = 'https://etnfwwmgjqydfxhztntd.supabase.co';
const defaultPublishableKey = 'sb_publishable_rdjgnSS8BzEhPK6exTX1Qw_Xf654LQf';

// Fallback to official project URL if not provided
const supabaseUrl = rawUrl || defaultUrl;

const resolvedKey = rawKey || defaultPublishableKey;

// Check if valid client key is provided
export const isSupabaseConfigured = Boolean(
  resolvedKey &&
  resolvedKey.length > 20 &&
  !resolvedKey.includes('YOUR_SUPABASE')
);

// If not configured, use safe placeholder JWT so createClient does not crash Vite bundling
const effectiveKey = isSupabaseConfigured
  ? resolvedKey
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
