import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import Brand from '../components/Brand';
import { rich, useT } from '../lib/i18n';
import LangToggle from '../components/LangToggle';

/* Landing page for the "reset your password" email. Supabase signs the user in from the
   link, then they choose a new password here. */
export default function ResetPassword() {
  const { t } = useT();
  const { session, loading, demo } = useAuth();
  const nav = useNavigate();
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [waited, setWaited] = useState(false);

  useEffect(() => { const t = window.setTimeout(() => setWaited(true), 4000); return () => window.clearTimeout(t); }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr('');
    if (pw.length < 8) { setErr(t('Use at least 8 characters.')); return; }
    if (pw !== pw2) { setErr("Those passwords don't match."); return; }
    if (demo) { setDone(true); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setDone(true);
    window.setTimeout(() => nav('/app'), 1600);
  };

  const ready = session || demo;
  return (
    <div className="auth">
      <Brand />
      <div className="auth__lang"><LangToggle /></div>
      <div className="auth__box">
        <span className="auth__icon">{done ? <Check size={26} /> : <KeyRound size={26} />}</span>
        {done ? (
          <>{rich(t("<x1>Password saved</x1><x2>You're signed in. Taking you to your cards...</x2>"), { x1: (c) => <h1>{c}</h1>, x2: (c) => <p className="auth__body" role="status">{c}</p> })}</>
        ) : !ready ? (
          loading || !waited
            ? <><h1>{t("Checking your link")}</h1><p className="auth__body"><Loader2 className="spin" size={16} /> {t("One moment...")}</p></>
            : <>{rich(t("<x1>This link has expired</x1><x2>Reset links work once and expire after a limited time. Request a new one and use it right away.</x2><x3>Back to sign in</x3>"), { x1: (c) => <h1>{c}</h1>, x2: (c) => <p className="auth__body">{c}</p>, x3: (c) => <Link className="btn btn--gold btn--lg" to="/login">{c}</Link> })}</>
        ) : (
          <>
            <h1>{t("Choose a new password")}</h1>
            <form onSubmit={submit} noValidate>
              <div className="fld">
                <label htmlFor="np">{t("New password")}</label>
                <span className="auth__pw">
                  <input id="np" type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder={t("At least 8 characters")} />
                  <button type="button" className="auth__eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </span>
              </div>
              <div className="fld">
                <label htmlFor="np2">{t("Type it again")}</label>
                <input id="np2" type={show ? 'text' : 'password'} autoComplete="new-password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
              </div>
              <button className="btn btn--gold btn--lg" disabled={busy}>{busy ? <Loader2 className="spin" size={18} /> : null} Save new password</button>
              {err && <p className="err" role="alert">{err}</p>}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
