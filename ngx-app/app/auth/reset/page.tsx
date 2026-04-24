'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const tokenHash    = searchParams.get('token_hash');

  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);

  if (!tokenHash) {
    return (
      <div className="auth-center-wrap">
        <div className="auth-notice-box">
          <p className="auth-setup-title">Invalid reset link</p>
          <p className="auth-setup-sub">This link has expired or is invalid. Please request a new one.</p>
          <button className="btn-login" style={{ marginTop: 16 }} onClick={() => router.push('/')}>
            Back to home
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="auth-center-wrap">
        <div className="auth-notice-box">
          <div style={{ fontSize: 28, color: 'var(--pos)', marginBottom: 8 }}>✓</div>
          <p className="auth-setup-title">Password updated</p>
          <p className="auth-setup-sub">You can now sign in with your new password.</p>
          <button className="btn-login" style={{ marginTop: 16 }} onClick={() => router.push('/')}>
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }
    setError('');
    setLoading(true);

    try {
      const res  = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenHash, password }),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? 'Failed to reset password.'); return; }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-center-wrap">
      <div className="auth-notice-box">
        <p className="auth-setup-title" style={{ marginBottom: 20 }}>Set new password</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              className="form-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Repeat password"
              required
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(197,86,62,0.1)', border: '0.5px solid rgba(197,86,62,0.3)', borderRadius: 2, fontSize: 12, color: 'var(--neg)' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetContent />
    </Suspense>
  );
}
