'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface Props {
  initialTab: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ initialTab, onClose }: Props) {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab);

  return (
    <div className="login-overlay" onClick={onClose}>
      <div className="login-box" onClick={e => e.stopPropagation()}>
        <div className="login-header">
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            <span style={{ color: 'var(--accent-light)' }}>NGX</span>Glass
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}
          >
            ✕
          </button>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => setTab('login')}
          >
            Log In
          </button>
          <button
            className={`login-tab${tab === 'signup' ? ' active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {tab === 'login'
          ? <LoginForm onSuccess={onClose} />
          : <SignupForm onSuccess={onClose} />
        }
      </div>
    </div>
  );
}
