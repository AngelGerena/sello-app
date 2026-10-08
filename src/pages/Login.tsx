import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Loader2, Check, Crown, Eye, EyeOff, KeyRound, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth, useProviders } from '../lib/auth';
import Brand from '../components/Brand';
import { PLANS } from '../lib/plans';
import { takeAuthError } from '../lib/authLanding';
import { DESIGN_COUNT } from '../lib/counts';
import { HAS_LEGAL, LEGAL } from '../lib/legal';
import { dollars, useOffer } from '../lib/offers';
import { rich, useT, tr } from '../lib/i18n';
import LangToggle from '../components/LangToggle';

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
  if (s.includes('invalid login')) return tr("That email and password don't match. Try again, or reset your password below.");
  if (s.includes('email not confirmed')) return tr('Your email is not verified yet. Open the verification link we sent, or tap Resend verification email.');
  if (s.includes('already registered') || s.includes('already been registered')) return tr('That email already has an account. Sign in instead.');
  if (s.includes('rate limit') || s.includes('too many')) return tr('Too many tries for now. Wait a few minutes and try again.');
  if (s.includes('password') && s.includes('characters')) return tr('Use at least 8 characters for your password.');
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
  const { t } = useT();
  const { session, demo } = useAuth();
  const offer = useOffer();
  const providers = useProviders();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [email, setEmail] = useState(() => params.get('email') ?? '');   // set when coming back from "I have verified my email"
  const [password, setPassword] = useState('');
  const [cool, setCool] = useState(0);   // seconds until another email may be requested (Supabase allows about one a minute)
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

  useEffect(() => { if (cool <= 0) return; const t = setTimeout(() => setCool((c) => c - 1), 1000); return () => clearTimeout(t); }, [cool]);

  if (session) return <Navigate to="/app" replace />;
  const isJoin = mode === 'signup';
  const showSent = (s: Screen) => { setCool(60); setScreen(s); };
  const verifiedHint = !isJoin && params.get('verified') === '1';
  const home = `${window.location.origin}/app`;
  const score = strength(password);

  const fail = (m: string) => { setErr(friendly(m)); setNeedsConfirm(m.toLowerCase().includes('not confirmed')); setBusy(''); };

  /* ---------------------------------------------- email and password */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(''); setNeedsConfirm(false);
    if (demo) { nav('/app'); return; }
    if (password.length < 8) { setErr(tr('Use at least 8 characters for your password.')); return; }
    setBusy('password');
    if (isJoin) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: home } });
      if (error) return fail(error.message);
      // Supabase hides whether an email exists; an empty identities list means it already does.
      if (data.user && data.user.identities && data.user.identities.length === 0) return fail('already registered');
      setBusy('');
      if (data.session) nav('/app'); else showSent('confirm');
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
    if (!email) { setErr(tr('Enter your email above first.')); return; }
    if (demo) { nav('/app'); return; }
    setBusy('link');
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: home, shouldCreateUser: true } });
    if (error) return fail(error.message);
    setBusy(''); showSent('link');
  };

  /* ---------------------------------------------- forgot password */
  const sendReset = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (demo) { showSent('reset-sent'); return; }
    setBusy('reset');
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset` });
    if (error) return fail(error.message);
    setBusy(''); showSent('reset-sent');
  };

  const resendConfirm = async () => {
    if (!email) { setErr(tr('Type your email above first, then tap Resend verification email.')); return; }
    setLinkNotice(null);
    setBusy('resend');
    const { error } = await supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: home } });
    if (error) return fail(error.message);
    setBusy(''); setErr(''); setNeedsConfirm(false); showSent('confirm');
  };

  /* ---------------------------------------------- screens */
  const goSignIn = () => { setScreen('form'); setErr(''); setPassword(''); nav(`/login?email=${encodeURIComponent(email)}&verified=1${plan ? `&plan=${plan.id}&billing=${billing}` : ''}`); };
  const wait = cool > 0 ? ` in ${cool}s` : '';
  const SentHead = ({ title, body }: { title: string; body: ReactNode }) => (
    <>
      <span className="auth__icon"><Mail size={26} aria-hidden /></span>
      <h1>{title}</h1>
      <p role="status" className="auth__body">{body}</p>
    </>
  );
  const SentFoot = ({ resend, label }: { resend: () => void; label: string }) => { const { t } = useT(); return (
    <>
      {err && <p className="err" role="alert">{err}</p>}
      <button type="button" className="btn btn--ghost" onClick={resend} disabled={cool > 0 || busy !== ''}>{busy === 'resend' || busy === 'link' || busy === 'reset' ? <Loader2 className="spin" size={16} /> : null}{cool > 0 ? `${label}${wait}` : label}</button>
      <p className="auth__fine">{t("Nothing after a minute? Check spam or promotions.")}</p>
      <button type="button" className="btn btn--ghost" onClick={() => { setScreen('form'); setErr(''); }}><ArrowLeft size={16} /> {t("Use a different email")}</button>
    </>
  ); };

  return (
    <div className="auth">
      <Brand />
      <div className="auth__lang"><LangToggle /></div>
      <div className="auth__box">
        {screen === 'confirm' && (
          <>
            <SentHead title={t("Verify your email")} body={<>{rich(t("A verification link is on its way to <b>{email}</b>. Verifying your email and signing in are two separate steps.", { email }), { b: (c) => <b>{c}</b> })}</>} />
            <ol className="auth__steps">
              <li>{rich(t("<b>Tap the link in the email.</b> It verifies your email and signs in the browser where it opens, so open it in the same browser you are using here if you can."), { b: (c) => <b>{c}</b> })}</li>
              <li>{rich(t("<b>Opened it on your phone or another device?</b> Your email is still verified. Come back to this screen and sign in with your email and password."), { b: (c) => <b>{c}</b> })}</li>
              <li>{rich(t("<b>The link opened inside your email app?</b> If you do not see your cards afterward, open the link in Safari or Chrome instead."), { b: (c) => <b>{c}</b> })}</li>
            </ol>
            <button type="button" className="btn btn--gold btn--lg" onClick={goSignIn}>{t("I have verified my email. Sign in")}</button>
            <p className="auth__fine">{t("Links work once and expire after a limited time. If a link says it expired or was already used, your email may already be verified, so try signing in.")}</p>
            <SentFoot resend={resendConfirm} label={t("Resend verification email")} />
          </>
        )}
        {screen === 'link' && (
          <>
            <SentHead title={t("Check your email")} body={<>{rich(t("A sign-in link is on its way to <b>{email}</b>. It signs in the browser where you open it, so open it on this device to continue here.", { email }), { b: (c) => <b>{c}</b> })}</>} />
            <ol className="auth__steps">
              <li>{rich(t("<b>Opened it on your phone?</b> You will be signed in on your phone, not here. To sign in on this device, request a new link from here or use your password."), { b: (c) => <b>{c}</b> })}</li>
              <li>{rich(t("<b>The link opened inside your email app?</b> If you do not see your cards afterward, open the link in Safari or Chrome instead."), { b: (c) => <b>{c}</b> })}</li>
              <li>{t("The link works once and expires after a limited time.")}</li>
            </ol>
            <SentFoot resend={sendLink} label={t("Send a new link")} />
          </>
        )}
        {screen === 'reset-sent' && (
          <>
            <SentHead title={t("Reset link sent")} body={<>{rich(t("If <b>{email}</b> has an account, a link to set a new password is on its way. It opens a page where you choose a new password, and you will be signed in on the device where you open it.", { email }), { b: (c) => <b>{c}</b> })}</>} />
            <ol className="auth__steps">{rich(t("<x1>The link works once and expires after a limited time.</x1><x2>Opened it on another device? Choose the new password there, then sign in here with it.</x2>"), { x1: (c) => <li>{c}</li>, x2: (c) => <li>{c}</li> })}</ol>
            <SentFoot resend={() => { void sendReset({ preventDefault() {} } as FormEvent); }} label={t("Send a new reset link")} />
          </>
        )}

        {screen === 'forgot' && (
          <>
            <span className="auth__icon"><KeyRound size={26} /></span>
            <h1>{t("Reset your password")}</h1>
            <p className="auth__body">{t("Enter your email to get a link for setting a new password. This also works if you first signed up with an email link and never made a password.")}</p>
            <form onSubmit={sendReset}>
              <div className="fld">
                <label htmlFor="remail">{t("Email")}</label>
                <input id="remail" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("you@yourbusiness.com")} />
              </div>
              <button className="btn btn--gold btn--lg" disabled={busy === 'reset'}>{busy === 'reset' ? <Loader2 className="spin" size={18} /> : <Mail size={18} />} Send reset link</button>
              {err && <p className="err" role="alert">{err}</p>}
            </form>
            <button type="button" className="btn btn--ghost" onClick={() => { setScreen('form'); setErr(''); }}><ArrowLeft size={16} /> {t("Back to sign in")}</button>
          </>
        )}

        {screen === 'form' && (
          <>
            <div className="auth__tabs" role="tablist" aria-label={t("Account")}>{rich(t("<x1>Sign in</x1><x2>Create account</x2>"), { x1: (c) => <Link role="tab" aria-selected={!isJoin} className={!isJoin ? 'on' : ''} to={plan ? `/login?plan=${plan.id}&billing=${billing}` : '/login'} onClick={() => setErr('')}>{c}</Link>, x2: (c) => <Link role="tab" aria-selected={isJoin} className={isJoin ? 'on' : ''} to={plan ? `/signup?plan=${plan.id}&billing=${billing}` : '/signup'} onClick={() => setErr('')}>{c}</Link> })}</div>

            {linkNotice && (
              <div className="auth__notice" role="alert">
                <p>{linkNotice}</p>
                <span className="auth__notice-acts">{rich(t("<x1>{v}</x1><x2>Email me a new sign-in link</x2>", { v: busy === 'resend' ? 'Sending...' : `Resend verification email${wait}` }), { x1: (c) => <button type="button" className="auth__link" onClick={resendConfirm} disabled={busy !== '' || cool > 0}>{c}</button>, x2: (c) => <button type="button" className="auth__link" onClick={sendLink} disabled={busy !== '' || cool > 0}>{c}</button> })}</span>
              </div>
            )}

            <h1>{isJoin ? t('Create your free account') : t('Welcome back')}</h1>
            {verifiedHint && <p className="auth__hint" role="status">{t("If you opened the verification link, your email is verified. Sign in below with your email and password.")}</p>}

            {isJoin && !plan && (
              <ul className="auth__perks">
                <li><Check size={16} /> {t("One card free, forever")}</li>
                <li><Check size={16} /> 3 free designs, and try all {DESIGN_COUNT} on your own card</li>
                <li><Check size={16} /> {t("No credit card to start")}</li>
              </ul>
            )}
            {plan && (
              <div className="auth__plan">
                <Crown size={20} />
                <span>{rich(t("<b>You picked {name}, {v}</b>{v2}", { name: plan.name, v: billing === 'year' ? `$${plan.yearly}/year` : `$${plan.price}/month`, v2: isJoin ? 'Create your account first. You\u2019ll finish the upgrade on the next screen, or keep the free Lite plan.' : 'Sign in and you\u2019ll finish the upgrade on the next screen.' }), { b: (c) => <b>{c}</b> })}</span>
                {plan.id === 'pro' && billing === 'month' && offer.known && offer.active && <small className="auth__offer">{t("Founding price: {price} a month if a spot is still open when you pay. One per person; it lasts while your subscription stays active.", { price: dollars(offer.cents) })}</small>}
              </div>
            )}

            {(providers.google || demo) && (
              <>
                <button type="button" className="btn auth__google" onClick={google} disabled={busy === 'google'}>
                  {busy === 'google' ? <Loader2 className="spin" size={18} /> : <GoogleMark />} Continue with Google
                </button>
                <div className="auth__or">{rich(t("<x1>or use your email</x1>"), { x1: (c) => <span>{c}</span> })}</div>
              </>
            )}

            <form onSubmit={submit} noValidate>
              <div className="fld">
                <label htmlFor="email">{t("Email")}</label>
                <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("you@yourbusiness.com")} />
              </div>
              <div className="fld">
                <span className="auth__pwhead">
                  <label htmlFor="password">{isJoin ? t('Create a password') : t('Password')}</label>
                  {!isJoin && <button type="button" className="auth__link" onClick={() => { setScreen('forgot'); setErr(''); }}>{t("Forgot password?")}</button>}
                </span>
                <span className="auth__pw">
                  <input id="password" type={show ? 'text' : 'password'} required minLength={8} autoComplete={isJoin ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isJoin ? 'At least 8 characters' : 'Your password'} />
                  <button type="button" className="auth__eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </span>
                {isJoin && password && (
                  <span className={`auth__meter s${score}`} aria-live="polite">
                    <i /><i /><i /><i />
                    <small>{password.length < 8 ? t('Too short: use at least 8 characters') : STRENGTH[score]}</small>
                  </span>
                )}
              </div>
              <button className="btn btn--gold btn--lg" disabled={busy === 'password'}>
                {busy === 'password' ? <Loader2 className="spin" size={18} /> : null}
                {isJoin ? t('Create my account') : t('Sign in')}
              </button>
              {err && (
                <p className="err" role="alert">
                  {err}{' '}
                  {needsConfirm && <button type="button" className="auth__link" onClick={resendConfirm} disabled={busy === 'resend'}>{t("Resend verification email")}</button>}
                  {!isJoin && err.includes("don't match") && <button type="button" className="auth__link" onClick={() => { setScreen('forgot'); setErr(''); }}>{t("Reset password")}</button>}
                </p>
              )}
            </form>

            <button type="button" className="auth__magic" onClick={sendLink} disabled={busy === 'link'}>
              {busy === 'link' ? <Loader2 className="spin" size={16} /> : <Mail size={16} />} Email me a sign-in link instead
            </button>

            {demo && <p className="auth__fine">{t("Demo: nothing is sent. Every button goes straight to the dashboard.")}</p>}
            {isJoin && HAS_LEGAL && <p className="auth__fine">{rich(t("By creating an account you agree to the <x1>Terms</x1> and <x2>Privacy Policy</x2>."), { x1: (c) => <a href={LEGAL.termsUrl!} target="_blank" rel="noopener">{c}</a>, x2: (c) => <a href={LEGAL.privacyUrl!} target="_blank" rel="noopener">{c}</a> })}</p>}
          </>
        )}
      </div>
    </div>
  );
}
