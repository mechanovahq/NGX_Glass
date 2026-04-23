'use client';

import { useState } from 'react';

interface Props {
  onSuccess: () => void;
}

export default function SignupForm({ onSuccess: _onSuccess }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) return;
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="auth-setup-notice">
        <div className="auth-setup-icon">⚙</div>
        <p className="auth-setup-title">Almost there, {name || 'friend'}!</p>
        <p className="auth-setup-sub">
          We&apos;re finishing up the database setup. Your account for{' '}
          <strong>{email}</strong> will be activated shortly.
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
        />
      </div>
      <div className="form-group">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-input"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Min. 6 characters"
          required
          minLength={6}
        />
      </div>
      <button type="submit" className="btn-login">
        Create Account
      </button>
    </form>
  );
}
