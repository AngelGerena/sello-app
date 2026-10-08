/* What Supabase leaves in the address bar after someone clicks an email link.

   Good link:    /app#access_token=...&type=signup      (the Supabase client signs them in)
   Bad link:     /app#error=access_denied&error_code=otp_expired&error_description=...
                 (expired, or already used: many mail apps "preview" a link and use it up)

   The router and the Supabase client both rewrite the address, so this file must be imported
   FIRST in main.tsx. It reads the address once, remembers it for a couple of minutes, and lets
   the Login and Dashboard screens show a clear message instead of a blank page. */

const ERR_KEY = 'fc.auth-error';
const WELCOME_KEY = 'fc.auth-welcome';
const FRESH_MS = 2 * 60 * 1000;

function landingParams(): URLSearchParams {
  const merged = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, '');
  if (hash.includes('=')) new URLSearchParams(hash).forEach((v, k) => merged.set(k, v));  // "#/route" has no "=" and is ignored
  return merged;
}

try {
  const p = landingParams();
  if (p.get('error_code') || p.get('error_description') || p.get('error') === 'access_denied') {
    sessionStorage.setItem(ERR_KEY, JSON.stringify({ code: p.get('error_code') || p.get('error') || '', at: Date.now() }));
  } else if (p.get('access_token') && p.get('type') === 'signup') {
    sessionStorage.setItem(WELCOME_KEY, String(Date.now()));
  }
} catch { /* storage blocked: the app still works, just without the friendly notices */ }

/** Plain-English message for a bad confirmation link, once. Null when there was no problem. */
export function takeAuthError(): string | null {
  try {
    const raw = sessionStorage.getItem(ERR_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(ERR_KEY);
    const { at } = JSON.parse(raw) as { code: string; at: number };
    if (Date.now() - at > FRESH_MS) return null;
    return 'That link has expired or was already used. Links work once, and some email apps open them in the background, which uses them up. If you already verified your email, just sign in below. If not, type your email and request a fresh link.';
  } catch { return null; }
}

/** True once, right after someone lands from a valid confirmation link. */
export function takeWelcome(): boolean {
  try {
    const raw = sessionStorage.getItem(WELCOME_KEY);
    if (!raw) return false;
    sessionStorage.removeItem(WELCOME_KEY);
    return Date.now() - Number(raw) <= FRESH_MS;
  } catch { return false; }
}

/** Drops any pending notice (used when someone signs in normally). */
export function clearAuthLanding() {
  try { sessionStorage.removeItem(ERR_KEY); sessionStorage.removeItem(WELCOME_KEY); } catch { /* ignore */ }
}
