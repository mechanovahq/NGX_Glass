'use client';

import { useState } from 'react';
import AuthModal from '@/components/auth/AuthModal';

const FEATURES = [
  {
    icon: '◈',
    title: 'Live Market Data',
    desc: '156 NGX-listed equities with real-time price updates every 60 seconds during market hours.',
  },
  {
    icon: '◉',
    title: 'Portfolio Tracker',
    desc: 'Track your holdings, monitor performance, and visualise allocation across sectors.',
  },
  {
    icon: '▦',
    title: 'Sector Heatmap',
    desc: 'Bubble-weighted visual overview of every NGX sector — spot movers at a glance.',
  },
  {
    icon: '◻',
    title: 'Regulatory Filings',
    desc: 'Browse SEC and NGX corporate disclosures, results, and board announcements.',
  },
];

export default function LandingPage() {
  const [authOpen, setAuthOpen] = useState<'login' | 'signup' | null>(null);

  return (
    <>
      <div className="landing">
        {/* ── Hero ── */}
        <section className="landing-hero">
          <div className="landing-hero-inner">
            <p className="landing-tagline">
              Nigeria&apos;s stock market, in sharp focus.
            </p>
            <p className="landing-desc">
              Real-time equities data, portfolio tracking, sector heatmaps,
              and regulatory filings — all in one clean interface.
            </p>

            <div className="landing-ctas">
              <button
                className="btn-primary landing-btn-primary"
                onClick={() => setAuthOpen('signup')}
              >
                Get Started — it&apos;s free
              </button>
              <button
                className="landing-btn-ghost"
                onClick={() => setAuthOpen('login')}
              >
                Sign In
              </button>
            </div>
          </div>

          <div className="landing-hero-glow" aria-hidden />
        </section>

        {/* ── Stats bar ── */}
        <div className="landing-stats">
          <div className="landing-stat">
            <span className="landing-stat-val">156</span>
            <span className="landing-stat-label">Listed Equities</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-val">60s</span>
            <span className="landing-stat-label">Price Refresh</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-val">14</span>
            <span className="landing-stat-label">NGX Sectors</span>
          </div>
          <div className="landing-stat-divider" />
          <div className="landing-stat">
            <span className="landing-stat-val">Free</span>
            <span className="landing-stat-label">During Beta</span>
          </div>
        </div>

        {/* ── Features ── */}
        <section className="landing-features">
          {FEATURES.map((f) => (
            <div key={f.title} className="landing-feature">
              <div className="landing-feature-icon">{f.icon}</div>
              <div className="landing-feature-title">{f.title}</div>
              <div className="landing-feature-desc">{f.desc}</div>
            </div>
          ))}
        </section>

        {/* ── Bottom CTA ── */}
        <section className="landing-bottom-cta">
          <p className="landing-bottom-label">Ready to start tracking?</p>
          <button
            className="btn-primary landing-btn-primary"
            onClick={() => setAuthOpen('signup')}
          >
            Create a free account
          </button>
        </section>
      </div>

      {authOpen && (
        <AuthModal
          initialTab={authOpen}
          onClose={() => setAuthOpen(null)}
        />
      )}
    </>
  );
}
