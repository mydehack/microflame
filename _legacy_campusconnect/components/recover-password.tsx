"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RecoverPassword() {
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requested, setRequested] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function requestCode() {
    setPending(true); setError(""); setNotice("");
    const response = await fetch("/api/auth/recover", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "send", username }) });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "Recovery could not be started.");
    else { setRequested(true); setNotice(result.message); }
    setPending(false);
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setPending(true); setError(""); setNotice("");
    if (password !== confirmPassword) { setError("Those passwords do not match."); setPending(false); return; }
    const response = await fetch("/api/auth/recover", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "reset", username, code, password }) });
    const result = await response.json();
    if (!response.ok) { setError(result.error ?? "Password recovery could not be completed."); setPending(false); return; }
    setNotice("Your password has been changed. Sign in with your new password.");
    setRequested(false); setCode(""); setPassword(""); setConfirmPassword("");
    setPending(false);
  }

  return <main className="auth-page">
    <section className="auth-panel"><div className="auth-content">
      <Link className="auth-brand mb-8" href="/login"><span className="brand-mark"><KeyRound size={17} /></span><span>CampusConnect<span className="text-[#76945e]"> AI</span></span></Link>
      <p className="page-eyebrow">Account recovery</p><h1>Reset your password.</h1>
      <p className="auth-intro">A code will be sent to the verified recovery email saved in your settings.</p>
      {error && <p className="notice error" role="alert">{error}</p>}{notice && <p className="notice mb-4" role="status"><MailCheck className="mr-2 inline" size={14} />{notice}</p>}
      {!requested ? <div className="grid gap-4"><div className="field"><label htmlFor="recovery-username">Username</label><Input id="recovery-username" autoComplete="username" autoCapitalize="none" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required minLength={3} maxLength={24} pattern="[a-z0-9_]+" /></div><Button type="button" disabled={pending || username.length < 3} onClick={() => void requestCode()}>{pending ? "Checking…" : "Send recovery code"}</Button></div> : <form className="grid gap-4" onSubmit={resetPassword}>
        <div className="field"><label htmlFor="recovery-username-reset">Username</label><Input id="recovery-username-reset" autoComplete="username" autoCapitalize="none" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required minLength={3} maxLength={24} pattern="[a-z0-9_]+" /></div>
        <div className="field"><label htmlFor="password-recovery-code">Six-digit code</label><Input id="password-recovery-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} required minLength={6} maxLength={6} /></div>
        <div className="field"><label htmlFor="new-password">New password</label><Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={10} maxLength={128} /></div>
        <div className="field"><label htmlFor="confirm-new-password">Confirm new password</label><Input id="confirm-new-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={10} maxLength={128} /></div>
        <Button type="submit" disabled={pending || code.length !== 6}>{pending ? "Updating…" : "Reset password"}</Button>
        <Button type="button" variant="ghost" onClick={() => { setRequested(false); setCode(""); }}>Request another code</Button>
      </form>}
      <p className="auth-footer"><Link href="/login"><ArrowLeft className="mr-1 inline" size={13} />Back to sign in</Link></p>
      <p className="mt-5 text-center text-[9px] leading-relaxed text-[var(--muted-ink)]">If you do not have a verified recovery email, sign in on another active session and add one in Profile & privacy settings.</p>
    </div></section>
  </main>;
}
