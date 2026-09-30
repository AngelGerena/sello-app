import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import Brand from '../components/Brand';

/* Landing page for the "reset your password" email. Supabase signs the user in from the
   link, then they choose a new password here. */
export default function ResetPassword() {
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
    if (pw.length < 8) { setErr('Use at least 8 characters.'); return; }
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
      <div className="auth__box">
        <span className="auth__icon">{done ? <Check size={26} /> : <KeyRound size={26} />}</span>
        {done ? (
          <><h1>Password saved</h1><p className="auth__body" role="status">You're signed in. Taking you to your cards...</p></>
        ) : !ready ? (
          loading || !waited
            ? <><h1>Checking your link</h1><p className="auth__body"><Loader2 className="spin" size={16} /> One moment...</p></>
            : <><h1>This link has expired</h1><p className="auth__body">Reset links work once and expire after an hour. Request a new one and use it right away.</p><Link className="btn btn--gold btn--lg" to="/login">Back to sign in</Link></>
        ) : (
          <>
            <h1>Choose a new password</h1>
            <form onSubmit={submit} noValidate>
              <div className="fld">
                <label htmlFor="np">New password</label>
                <span className="auth__pw">
                  <input id="np" type={show ? 'text' : 'password'} autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
                  <button type="button" className="auth__eye" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </span>
              </div>
              <div className="fld">
                <label htmlFor="np2">Type it again</label>
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
