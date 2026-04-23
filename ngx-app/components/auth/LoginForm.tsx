'use client';

import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

export default function LoginForm({ onSuccess: _onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-setup-notice">
        <div className="auth-setup-icon">⚙</div>
        <p className="auth-setup-title">Authentication coming soon</p>
        <p className="auth-setup-sub">
          We&apos;re finishing up the database setup. Check back shortly — your account for{' '}
          <strong>{email}</strong> will be ready to use.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />
      </div>
      <button type="submit" className="btn-login">
        Sign In
      </button>
    </form>
  );
}
