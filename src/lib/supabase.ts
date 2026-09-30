import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Demo mode: the seeded, no-backend build (Track A) or a deploy missing its env vars. */
export const IS_DEMO = import.meta.env.VITE_DEMO === '1' || !url || !key;

export const configError = !IS_DEMO || import.meta.env.VITE_DEMO === '1' ? null
  : 'Not connected to the database. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify under Site configuration, Environment variables, then redeploy.';

export const supabase = createClient(url ?? 'https://placeholder.supabase.co', key ?? 'placeholder');
