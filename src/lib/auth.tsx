import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { IS_DEMO, supabase } from './supabase';

interface AuthState { session: Session | null; loading: boolean; demo: boolean; }
const AuthCtx = createContext<AuthState>({ session: null, loading: true, demo: IS_DEMO });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!IS_DEMO);

  useEffect(() => {
    if (IS_DEMO) return;
    let alive = true;
    const bail = setTimeout(() => { if (alive) setLoading(false); }, 8000); // never hang on a spinner
    supabase.auth.getSession().then(({ data }) => { if (alive) setSession(data.session); }).finally(() => { if (alive) { setLoading(false); clearTimeout(bail); } });
    // Never await a query inside this callback: the client holds a lock here (deadlock).
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { if (!alive) return; setSession(s); setLoading(false); });
    return () => { alive = false; clearTimeout(bail); sub.subscription.unsubscribe(); };
  }, []);

  return <AuthCtx.Provider value={{ session, loading, demo: IS_DEMO }}>{children}</AuthCtx.Provider>;
}

/** Which sign-in providers are switched on in Supabase. Read from the public auth settings,
    so the Google button appears by itself once Google is enabled in the dashboard. */
export function useProviders() {
  const [p, setP] = useState<{ google: boolean; apple: boolean; ready: boolean }>({ google: false, apple: false, ready: IS_DEMO });
  useEffect(() => {
    if (IS_DEMO) return;
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
    if (!url || !key) { setP((x) => ({ ...x, ready: true })); return; }
    let alive = true;
    fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
      .then((r) => (r.ok ? r.json() : null))
      .then((s) => { if (alive) setP({ google: !!s?.external?.google, apple: !!s?.external?.apple, ready: true }); })
      .catch(() => { if (alive) setP((x) => ({ ...x, ready: true })); });
    return () => { alive = false; };
  }, []);
  return p;
}
