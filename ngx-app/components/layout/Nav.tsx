'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

const NAV_TABS = [
  { label: 'Market',     href: '/' },
  { label: 'Heatmap',   href: '/heatmap' },
  { label: 'Filings',   href: '/disclosures' },
  { label: 'Portfolio', href: '/portfolio' },
  { label: 'News',      href: '/news' },
];

export default function Nav() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [authOpen, setAuthOpen] = useState<'login' | 'signup' | null>(null);

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
            const isActive = tab.href === '/'
              ? pathname === '/'
              : pathname.startsWith(tab.href);
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
          <button className="btn-sm" onClick={() => setAuthOpen('login')}>Log In</button>
          <button className="btn-primary" onClick={() => setAuthOpen('signup')}>Get Started</button>
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
