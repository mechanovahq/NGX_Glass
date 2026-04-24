'use client';

import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

const PASSWORD_HINTS = [
  '8+ characters',
  'uppercase & lowercase',
  'a number',
  'a special character',
];

export default function SignupForm({ onSuccess }: Props) {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.status === 400) {
        setError(data.error ?? 'Please check your input.');
        return;
      }

      // 201 = created, 200 = generic (email taken, shown same message)
      setDone(true);
      setTimeout(onSuccess, 4000);
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="auth-setup-notice">
        <div style={{ fontSize: 28, color: 'var(--pos)', marginBottom: 8 }}>✓</div>
        <p className="auth-setup-title">Check your email</p>
        <p className="auth-setup-sub">
          A verification link has been sent to <strong>{email}</strong>.
          Click it to activate your account, then sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input
          type="text"
          className="form-input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          required
          autoComplete="name"
        />
      </div>
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
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 8 characters"
          required
          autoComplete="new-password"
        />
        <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
          {PASSWORD_HINTS.map(h => (
            <span key={h} style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              · {h}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(197,86,62,0.1)', border: '0.5px solid rgba(197,86,62,0.3)', borderRadius: 2, fontSize: 12, color: 'var(--neg)' }}>
          {error}
        </div>
      )}

      <button type="submit" className="btn-login" disabled={loading}>
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  );
}
