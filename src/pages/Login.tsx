import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, Check, Crown, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth, useProviders } from '../lib/auth';
import Brand from '../components/Brand';
import { PLANS } from '../lib/plans';
import { takeAuthError } from '../lib/authLanding';

/* Sign in and sign up on one screen, three ways in:
   1. Continue with Google (shows only when Google is enabled in Supabase)
   2. Email and password, with forgot password
   3. Email me a sign-in link (magic link), as a fallback
   A paid plan picked on the pricing section is remembered and offered right after the
   account exists; nobody is charged before they have one. */
export const INTENT_KEY = 'fc.plan-intent';

type Screen = 'form' | 'confirm' | 'link' | 'forgot' | 'reset-sent';

const friendly = (m: string) => {
  const s = m.toLowerCase();
  if (s.includes('invalid login')) return "That email and password don't match. Try again, or reset your password below.";
  if (s.includes('email not confirmed')) return 'Please confirm your email first. We can send the confirmation again.';
  if (s.includes('already registered') || s.includes('already been registered')) return 'That email already has an account. Sign in instead.';
  if (s.includes('rate limit') || s.includes('too many')) return 'Too many tries for now. Wait a few minutes and try again.';
  if (s.includes('password') && s.includes('characters')) return 'Use at least 8 characters for your password.';
  return m;
};

function strength(pw: string) {
  let n = 0;
  if (pw.length >= 8) n++;
  if (pw.length >= 12) n++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) n++;
  if (/\d/.test(pw)) n++;
  if (/[^A-Za-z0-9]/.test(pw)) n++;
  return Math.min(4, n);
}
const STRENGTH = ['Too short', 'Weak', 'Okay', 'Strong', 'Very strong'];

function GoogleMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export default function Login({ mode }: { mode: 'signup' | 'signin' }) {
  const { session, demo } = useAuth();
  const providers = useProviders();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [screen, setScreen] = useState<Screen>('form');
  const [busy, setBusy] = useState<'' | 'password' | 'google' | 'link' | 'reset' | 'resend'>('');
  const [err, setErr] = useState('');
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const [linkNotice, setLinkNotice] = useState<string | null>(() => takeAuthError());   // bad confirmation link

  const planId = params.get('plan');
  const plan = PLANS.find((p) => p.id === planId && p.price > 0);
  const billing = params.get('billing') === 'year' ? 'year' : 'month';
  if (plan) { try { localStorage.setItem(INTENT_KEY, plan.id); localStorage.setItem('fc.plan-interval', billing); } catch { /* storage blocked */ } }

  if (session) return <Navigate to="/app" replace />;
  const isJoin = mode === 'signup';
  const home = `${window.location.origin}/app`;
  const score = strength(password);

  const fail = (m: string) => { setErr(friendly(m)); setNeedsConfirm(m.toLowerCase().includes('not confirmed')); setBusy(''); };

  /* ---------------------------------------------- email and password */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setNeedsConfirm(false);
    if (demo) { nav('/app'); return; }
    if (password.length < 8) { setErr('Use at least 8 characters for your password.'); return; }
    setBusy('password');
    if (isJoin) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: home } });
      if (error) return fail(error.message);
      // Supabase hides whether an email exists; an empty identities list means it already does.
      if (data.user && data.user.identities && data.user.identities.length === 0) return fail('already registered');
      setBusy('');
      if (data.session) nav('/app'); else setScreen('confirm');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return fail(error.message);
      setBusy('');
      nav('/app');
    }
  };

  /* ---------------------------------------------- Google */
  const google = async () => {
    setErr('');
    if (demo) { nav('/app'); return; }
    setBusy('google');
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: home } });
    if (error) fail(error.message);   // on success the browser leaves for Google
  };

  /* ---------------------------------------------- magic link */
  const sendLink = async () => {
    setErr('');
    if (!email) { setErr('Enter your email above first.'); return; }
    if (demo) { nav('/app'); return; }
    setBusy('link');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: home, shouldCreateUser: true } });
    if (error) return fail(error.message);
    setBusy(''); setScreen('link');
  };

  /* ---------------------------------------------- forgot password */
  const sendReset = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (demo) { setScreen('reset-sent'); return; }
    setBusy('reset');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` });
    if (error) return fail(error.message);
    setBusy(''); setScreen('reset-sent');
  };

  const resendConfirm = async () => {
    if (!email) { setErr('Type your email above first, then tap Resend confirmation.'); return; }
    setLinkNotice(null);
    setBusy('resend');
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: home } });
    if (error) return fail(error.message);
    setBusy(''); setErr(''); setNeedsConfirm(false); setScreen('confirm');
  };

  /* ---------------------------------------------- screens */
  const Sent = ({ title, body }: { title: string; body: ReactNode }) => (
    <>
      <span className="auth__icon"><Mail size={26} /></span>
      <h1>{title}</h1>
      <p role="status" className="auth__body">{body}</p>
      <p className="auth__fine">Nothing after a minute? Check spam or promotions.</p>
      <button type="button" className="btn btn--ghost" onClick={() => { setScreen('form'); setErr(''); }}><ArrowLeft size={16} /> Back to sign in</button>
    </>
  );

  return (
    <div className="auth">
      <Brand />
      <div className="auth__box">
        {screen === 'confirm' && <Sent title="Confirm your email" body={<>We sent a confirmation link to <b>{email}</b>. Tap it and you're in. After that, you'll sign in with your email and password.</>} />}
        {screen === 'link' && <Sent title="Check your email" body={<>We sent a sign-in link to <b>{email}</b>. Open it on this device. It works once and expires in an hour.</>} />}
        {screen === 'reset-sent' && <Sent title="Reset link sent" body={<>If <b>{email}</b> has an account, a link to set a new password is on its way. It expires in an hour.</>} />}

        {screen === 'forgot' && (
          <>
            <span className="auth__icon"><KeyRound size={26} /></span>
            <h1>Reset your password</h1>
            <p className="auth__body">Enter your email and we'll send a link to set a new password. This also works if you first signed up with an email link and never made a password.</p>
            <form onSubmit={sendReset}>
              <div className="fld">
                <label htmlFor="remail">Email</label>
                <input id="remail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" />
              </div>
              <button className="btn btn--gold btn--lg" disabled={busy === 'reset'}>{busy === 'reset' ? <Loader2 className="spin" size={18} /> : <Mail size={18} />} Send reset link</button>
              {err && <p className="err" role="alert">{err}</p>}
            </form>
            <button type="button" className="btn btn--ghost" onClick={() => { setScreen('form'); setErr(''); }}><ArrowLeft size={16} /> Back to sign in</button>
          </>
        )}

        {screen === 'form' && (
          <>
            <div className="auth__tabs" role="tablist" aria-label="Account">
              <Link role="tab" aria-selected={!isJoin} className={!isJoin ? 'on' : ''} to={plan ? `/login?plan=${plan.id}&billing=${billing}` : '/login'} onClick={() => setErr('')}>Sign in</Link>
              <Link role="tab" aria-selected={isJoin} className={isJoin ? 'on' : ''} to={plan ? `/signup?plan=${plan.id}&billing=${billing}` : '/signup'} onClick={() => setErr('')}>Create account</Link>
            </div>

            {linkNotice && (
              <div className="auth__notice" role="alert">
                <p>{linkNotice}</p>
                <button type="button" className="auth__link" onClick={resendConfirm} disabled={busy === 'resend'}>{busy === 'resend' ? 'Sending...' : 'Resend confirmation'}</button>
              </div>
            )}

            <h1>{isJoin ? 'Create your free account' : 'Welcome back'}</h1>

            {isJoin && !plan && (
              <ul className="auth__perks">
                <li><Check size={16} /> One card free, forever</li>
                <li><Check size={16} /> 3 free designs, and try all 107 on your own card</li>
                <li><Check size={16} /> No credit card to start</li>
              </ul>
            )}
            {plan && (
              <div className="auth__plan">
                <Crown size={20} />
                <span><b>You picked {plan.name}, {billing === 'year' ? `$${plan.yearly}/year` : `$${plan.price}/month`}</b>{isJoin ? 'Create your account first. You\u2019ll finish the upgrade on the next screen, or keep the free Lite plan.' : 'Sign in and you\u2019ll finish the upgrade on the next screen.'}</span>
              </div>
            )}

            {(providers.google || demo) && (
              <>
                <button type="button" className="btn auth__google" onClick={google} disabled={busy === 'google'}>
                  {busy === 'google' ? <Loader2 className="spin" size={18} /> : <GoogleMark />} Continue with Google
                </button>
                <div className="auth__or"><span>or use your email</span></div>
              </>
            )}

            <form onSubmit={submit} noValidate>
              <div className="fld">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" />
              </div>
              <div className="fld">
                <span className="auth__pwhead">
                  <label htmlFor="password">{isJoin ? 'Create a password' : 'Password'}</label>
                  {!isJoin && <button type="button" className="auth__link" onClick={() => { setScreen('forgot'); setErr(''); }}>Forgot password?</button>}
                </span>
                <span className="auth__pw">
                  <input id="password" type={show ? 'text' : 'password'} required minLength={8} autoComplete={isJoin ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isJoin ? 'At least 8 characters' : 'Your password'} />
                  <button type="button" className="auth__eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </span>
                {isJoin && password && (
                  <span className={`auth__meter s${score}`} aria-live="polite">
                    <i /><i /><i /><i />
                    <small>{password.length < 8 ? 'Too short: use at least 8 characters' : STRENGTH[score]}</small>
                  </span>
                )}
              </div>
              <button className="btn btn--gold btn--lg" disabled={busy === 'password'}>
                {busy === 'password' ? <Loader2 className="spin" size={18} /> : null}
                {isJoin ? 'Create my account' : 'Sign in'}
              </button>
              {err && (
                <p className="err" role="alert">
                  {err}{' '}
                  {needsConfirm && <button type="button" className="auth__link" onClick={resendConfirm} disabled={busy === 'resend'}>Resend confirmation</button>}
                  {!isJoin && err.includes("don't match") && <button type="button" className="auth__link" onClick={() => { setScreen('forgot'); setErr(''); }}>Reset password</button>}
                </p>
              )}
            </form>

            <button type="button" className="auth__magic" onClick={sendLink} disabled={busy === 'link'}>
              {busy === 'link' ? <Loader2 className="spin" size={16} /> : <Mail size={16} />} Email me a sign-in link instead
            </button>

            {demo && <p className="auth__fine">Demo: nothing is sent. Every button goes straight to the dashboard.</p>}
            {isJoin && <p className="auth__fine">By creating an account you agree to the Terms and Privacy Policy.</p>}
          </>
        )}
      </div>
    </div>
  );
}
