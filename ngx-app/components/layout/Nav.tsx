'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useState, useEffect } from 'react';
import AuthModal from '@/components/auth/AuthModal';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

const NAV_TABS = [
  { label: 'Market',     href: '/market' },
  { label: 'Heatmap',   href: '/heatmap' },
  { label: 'Filings',   href: '/disclosures' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'News',      href: '/news' },
];

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [authOpen, setAuthOpen] = useState<'login' | 'signup' | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const isLanding = pathname === '/';

  useEffect(() => {
    try {
      const sb = createClient();
      sb.auth.getUser().then(({ data }) => setUser(data.user ?? null)).catch(() => {});
      const { data: { subscription } } = sb.auth.onAuthStateChange((_e, session) => {
        setUser(session?.user ?? null);
      });
      return () => subscription.unsubscribe();
    } catch {
      // Supabase not configured — stay logged out
    }
  }, []);

  return (
    <>
      <nav>
        <Link href="/" className="nav-logo">
          <div className="nav-logo-icon">
            <Image src="/ngxglass-logo.png" alt="NGXGlass" width={26} height={26} />
          </div>
          <span className="nav-logo-wordmark">
            <span>NGX</span>Glass
          </span>
          <span className="nav-badge">Beta</span>
        </Link>

        <div className="nav-divider" />
        <div className="nav-tabs">
          {NAV_TABS.map(tab => {
            const isActive = !isLanding && pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`nav-tab${isActive ? ' active' : ''}`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="nav-right">
          <button
            className="icon-btn"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle theme"
            style={{ fontSize: 12 }}
          >
            {theme === 'dark' ? '◐' : '◑'}
          </button>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="user-avatar" title={user.email ?? ''}>
                {(user.user_metadata?.full_name?.[0] ?? user.email?.[0] ?? '?').toUpperCase()}
              </div>
              <button
                className="btn-sm"
                onClick={() => {
                  try { createClient().auth.signOut(); } catch {}
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <button className="btn-sm" onClick={() => setAuthOpen('login')}>Log In</button>
              <button className="btn-primary" onClick={() => setAuthOpen('signup')}>Get Started</button>
            </>
          )}
        </div>
      </nav>

      {authOpen && (
        <AuthModal
          initialTab={authOpen}
          onClose={() => setAuthOpen(null)}
        />
      )}
    </>
  );
}
