import { useEffect, useState } from 'react';
import { useAuth } from './auth';
import { supabase } from './supabase';

/* Is the signed-in person a platform admin? A person can read only their own row in fc_admins,
   so this is a yes/no answer for them and nobody else. The real protection lives in the database:
   every admin function checks the same table itself. */
const cache = new Map<string, boolean>();

export function useIsAdmin(): { isAdmin: boolean; ready: boolean } {
  const { session, demo, loading } = useAuth();
  const uid = session?.user.id ?? '';
  const [state, setState] = useState<{ uid: string; isAdmin: boolean } | null>(() => (uid && cache.has(uid) ? { uid, isAdmin: cache.get(uid)! } : null));

  useEffect(() => {
    if (demo || !uid) return;
    if (cache.has(uid)) { setState({ uid, isAdmin: cache.get(uid)! }); return; }
    let alive = true;
    supabase.from('fc_admins').select('user_id').eq('user_id', uid).maybeSingle().then(
      ({ data }) => { const v = !!data; cache.set(uid, v); if (alive) setState({ uid, isAdmin: v }); },
      () => { if (alive) setState({ uid, isAdmin: false }); },
    );
    return () => { alive = false; };
  }, [uid, demo]);

  if (demo) return { isAdmin: true, ready: true };
  if (loading) return { isAdmin: false, ready: false };
  if (!uid) return { isAdmin: false, ready: true };
  return { isAdmin: state?.uid === uid && state.isAdmin, ready: state?.uid === uid };
}
