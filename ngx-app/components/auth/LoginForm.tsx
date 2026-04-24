'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Props {
  onSuccess: () => void;
  onForgotPassword: () => void;
}

export default function LoginForm({ onSuccess, onForgotPassword }: Props) {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Login failed. Please try again.');
        return;
      }

      // Store session in cookies via Supabase browser client
      const sb = createClient();
      await sb.auth.setSession({
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      onSuccess();
      router.push('/market');
      router.refresh();
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
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
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />
      </div>

      <div style={{ textAlign: 'right', marginBottom: 14 }}>
        <button
          type="button"
          onClick={onForgotPassword}
          style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          Forgot password?
        </button>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(197,86,62,0.1)', border: '0.5px solid rgba(197,86,62,0.3)', borderRadius: 2, fontSize: 12, color: 'var(--neg)' }}>{error}</div>}

      <button type="submit" className="btn-login" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  );
}
