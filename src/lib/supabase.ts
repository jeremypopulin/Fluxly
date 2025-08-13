// src/lib/supabase.ts
import { createClient, Session, SupabaseClient } from '@supabase/supabase-js';

// --- Project values (same as you had) ---
const supabaseUrl = 'https://diyuewnatraebokzeatl.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpeXVld25hdHJhZWJva3plYXRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2NjEzNjIsImV4cCI6MjA2OTIzNzM2Mn0.xvAbWWQaVKpOfmMVvJEqjUaMgxG6t82BGUpVwe8r8HE';

// --- Safe storage (prevents SSR/build issues) ---
const safeStorage: Storage =
  typeof window !== 'undefined'
    ? window.localStorage
    : ({
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        length: 0,
        clear: () => {},
        key: () => null,
      } as any);

// --- Create client with persistence + auto refresh ---
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: safeStorage,
  },
});

// Optional: debug auth churn
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[supabase] auth event:', event, {
    user: session?.user?.id,
    exp: session?.expires_at,
  });
});

// --- Helpers to guarantee a fresh session/token ---
const EXPIRY_BUFFER_MS = 60_000; // refresh if < 60s remaining

/** Ensure we have a valid (non-expired) session; refresh if near expiry. */
export async function getValidSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.warn('[supabase] getSession error:', error);
  }

  let session = data?.session ?? null;

  if (session?.expires_at) {
    const msUntilExpiry = session.expires_at * 1000 - Date.now();
    if (msUntilExpiry < EXPIRY_BUFFER_MS) {
      const { data: refData, error: refErr } = await supabase.auth.refreshSession();
      if (refErr || !refData?.session) {
        console.warn('[supabase] refresh failed; signing out');
        await supabase.auth.signOut();
        return null;
      }
      session = refData.session;
    }
  }

  if (!session) return null;
  return session;
}

/** Run a function that needs auth, after ensuring the session is valid. */
export async function withValidSession<T>(
  fn: (session: Session) => Promise<T>
): Promise<T> {
  const session = await getValidSession();
  if (!session) throw new Error('Not authenticated. Please log in again.');
  return fn(session);
}

/**
 * Call a Supabase Edge Function with a guaranteed-fresh JWT.
 * - Adds Authorization header
 * - Retries once on token errors after a refresh
 */
export async function invokeEdge<T = any>(
  fnName: string,
  body?: Record<string, any>
): Promise<{ data: T | null; error: { message: string } | null }> {
  // 1) Ensure valid (may refresh)
  let session = await getValidSession();
  if (!session) {
    return { data: null, error: { message: 'Not authenticated. Please log in again.' } };
  }

  // 2) First attempt
  let res = await supabase.functions.invoke<T>(fnName, {
    body,
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  // 3) If JWT issue, refresh once and retry
  const tokenErrors = [
    'jwt expired',
    'invalid jwt',
    'invalid signature',
    'token is expired',
    'unauthorized',
  ];

  const isTokenProblem =
    res.error?.message &&
    tokenErrors.some((t) => res.error!.message.toLowerCase().includes(t));

  if (isTokenProblem) {
    const { data: refData, error: refErr } = await supabase.auth.refreshSession();
    if (refErr || !refData?.session) {
      await supabase.auth.signOut();
      return { data: null, error: { message: 'Session expired. Please log in again.' } };
    }
    session = refData.session;
    res = await supabase.functions.invoke<T>(fnName, {
      body,
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
  }

  return res;
}
