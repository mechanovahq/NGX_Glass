'use client';

import { useState } from 'react';

interface Props {
  onBack: () => void;
}

export default function ResetPasswordForm({ onBack }: Props) {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok && res.status === 429) {
        setError('Too many requests. Please wait before trying again.');
        return;
      }

      setSent(true);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="auth-setup-notice">
        <div style={{ fontSize: 24, color: 'var(--accent)', marginBottom: 8 }}>✉</div>
        <p className="auth-setup-title">Reset link sent</p>
        <p className="auth-setup-sub">
          If <strong>{email}</strong> has an account, you'll receive a reset link within a few minutes.
          Check your spam folder if you don't see it.
        </p>
        <button
          onClick={onBack}
          style={{ marginTop: 16, background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}
        >
          ← Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18, lineHeight: 1.6 }}>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          autoComplete="email"
        />
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(197,86,62,0.1)', border: '0.5px solid rgba(197,86,62,0.3)', borderRadius: 2, fontSize: 12, color: 'var(--neg)' }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn-login" disabled={loading}>
        {loading ? 'Sending…' : 'Send Reset Link'}
      </button>

      <button
        type="button"
        onClick={onBack}
        style={{ width: '100%', marginTop: 10, background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--mono)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}
      >
        ← Back to sign in
      </button>
    </form>
  );
}
