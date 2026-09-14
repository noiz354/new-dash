'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BadgeCheck, KeyRound, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/Logo';
import { CANON } from '@/lib/canon';

type Step = 'login' | 'mfa' | 'done';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const DEMO_CODE = '482916';

/** Sign in — M3 port (reference: web/login.html). SSO + enforced MFA + done. */
export function LoginForm() {
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState<string>(CANON.sessionEmail);
  const [pass, setPass] = useState('demo-pass-4821');
  const [touched, setTouched] = useState(false);
  const [loginState, setLoginState] = useState('Demo flow — simulated MFA follows. No real authentication.');
  const [ssoBusy, setSsoBusy] = useState(false);
  const [code, setCode] = useState('');
  const [mfaError, setMfaError] = useState(false);

  const emailOk = EMAIL_RE.test(email.trim());
  const passOk = pass.length > 0;

  const submitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (emailOk && passOk) setStep('mfa');
  };

  const sso = () => {
    if (ssoBusy) return;
    setSsoBusy(true);
    setLoginState('Simulating SAML redirect… then demo MFA.');
    setTimeout(() => {
      setSsoBusy(false);
      setStep('mfa');
    }, 900);
  };

  const verify = () => {
    const ok = code.replace(/\s/g, '') === DEMO_CODE;
    setMfaError(!ok);
    if (ok) setStep('done');
  };

  return (
    <main className="w-full max-w-md flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <Logo className="h-12 w-auto" />
        <h1 className="text-2xl font-semibold tracking-tight">Sign in to Apex Ops</h1>
        <p className="text-sm text-muted">
          Tenant <span className="apex-id font-semibold text-ink">{CANON.tenant}</span> · Nusantara Tower · WIB (UTC+7)
        </p>
      </div>

      {step === 'login' && (
        <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4" aria-labelledby="login-h">
          <h2 id="login-h" className="sr-only">Credentials</h2>
          <form className="flex flex-col gap-3" noValidate onSubmit={submitLogin}>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" htmlFor="login-email">Work email</label>
              <Input
                id="login-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                invalid={touched && !emailOk}
                className="h-10 text-sm"
              />
              {touched && !emailOk && <p className="text-xs font-semibold text-fail">Enter a valid work email.</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold" htmlFor="login-pass">Password</label>
              <Input
                id="login-pass"
                type="password"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                invalid={touched && !passOk}
                className="h-10 text-sm"
              />
              {touched && !passOk && <p className="text-xs font-semibold text-fail">Password is required.</p>}
            </div>
            <p className="text-xs text-muted" role="status">{loginState}</p>
            <Button type="submit" className="h-10">
              {ssoBusy && <LoaderCircle size={16} className="animate-spin" />}
              Continue with Email
            </Button>
          </form>
          <div className="flex items-center gap-2 text-xs text-muted"><span className="flex-1 h-px bg-border-subtle" />or<span className="flex-1 h-px bg-border-subtle" /></div>
          <Button variant="secondary" className="h-10" onClick={sso} disabled={ssoBusy}>
            {ssoBusy ? <LoaderCircle size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Continue with SSO (SAML / OIDC)
          </Button>
          <p className="text-xs text-muted text-center">
            SSO &amp; Security Policies · SCIM v2.4 provisioning ·{' '}
            <Link className="text-cobalt-deep font-semibold hover:underline" href="/organization">Open org hub</Link>
          </p>
        </section>
      )}

      {step === 'mfa' && (
        <section className="bg-card border border-border-subtle rounded-lg p-6 flex flex-col gap-4" aria-labelledby="mfa-h">
          <h2 id="mfa-h" className="text-lg font-semibold">Two-factor verification</h2>
          <p className="text-sm text-muted">
            Enter the 6-digit code from your authenticator. Demo code:{' '}
            <span className="apex-id font-bold text-ink">482 916</span>
          </p>
          <label className="text-xs font-semibold" htmlFor="mfa-code">6-digit code</label>
          <input
            id="mfa-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6)); setMfaError(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') verify(); }}
            className="h-12 px-3 border-2 border-cobalt-deep rounded text-center font-mono text-xl tracking-[0.4em] outline-none"
          />
          {mfaError && <p className="text-xs font-semibold text-fail">Wrong code — try again.</p>}
          <p className="text-xs text-muted" role="status">Demo MFA · static code · no real authentication.</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="h-10 px-4" onClick={() => setStep('login')}>Back</Button>
            <Button className="flex-1 h-10" onClick={verify}>Verify &amp; Sign In</Button>
          </div>
        </section>
      )}

      {step === 'done' && (
        <section className="bg-card border border-pass rounded-lg p-6 flex flex-col gap-3 text-center" aria-labelledby="done-h">
          <BadgeCheck size={48} className="text-pass mx-auto" />
          <h2 id="done-h" className="text-lg font-semibold">Signed in</h2>
          <p className="text-sm text-muted">
            {CANON.sessionUser} · {CANON.sessionRole}<br />
            Demo session {CANON.tenant} · <Link className="text-cobalt-deep font-semibold hover:underline" href="/profile">Manage sessions</Link>
          </p>
          <Link href="/">
            <Button className="h-10 w-full">Open Operations Dashboard</Button>
          </Link>
        </section>
      )}

      <p className="text-xs text-muted text-center">
        Apex Ops CMMS — demo prototype (no backend) · <Link className="font-semibold hover:underline" href="/settings">Simulated system status</Link>
      </p>
    </main>
  );
}
