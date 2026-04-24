'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import ResetPasswordForm from './ResetPasswordForm';

type Tab = 'login' | 'signup' | 'reset';

interface Props {
  initialTab: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({ initialTab, onClose }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);

  return (
    <div className="login-overlay open" onClick={onClose}>
      <div className="login-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '0.5px solid var(--border)',
        }}>
          <span style={{ fontWeight: 800, fontSize: 15 }}>
            <span style={{ color: 'var(--accent)' }}>NGX</span>Glass
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {tab !== 'reset' && (
          <div className="login-tabs">
            <button
              className={`login-tab-btn${tab === 'login' ? ' active' : ''}`}
              onClick={() => setTab('login')}
            >
              Sign In
            </button>
            <button
              className={`login-tab-btn${tab === 'signup' ? ' active' : ''}`}
              onClick={() => setTab('signup')}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Forms */}
        <div style={{ padding: '20px 24px 28px' }}>
          {tab === 'login'  && (
            <LoginForm
              onSuccess={onClose}
              onForgotPassword={() => setTab('reset')}
            />
          )}
          {tab === 'signup' && <SignupForm onSuccess={onClose} />}
          {tab === 'reset'  && <ResetPasswordForm onBack={() => setTab('login')} />}
        </div>

      </div>
    </div>
  );
}
