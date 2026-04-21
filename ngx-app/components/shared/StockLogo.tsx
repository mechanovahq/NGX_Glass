'use client';

import { useState } from 'react';
import { STOCK_DOMAINS, NGX_SVG_SYMS, NGXPULSE_BASE, LOGO_SEC_CLR } from '@/lib/data/stockDomains';

interface Props {
  sym: string;
  sec?: string;
  size?: number;
}

type Stage = 'ngxpulse' | 'clearbit' | 'google' | 'letter';

export default function StockLogo({ sym, sec = 'Unknown', size = 28 }: Props) {
  const [stage, setStage] = useState<Stage>('ngxpulse');
  const domain = STOCK_DOMAINS[sym] || '';
  const color = LOGO_SEC_CLR[sec] || '#64748b';
  const letter = sym[0];
  const r = Math.round(size * 0.27);

  function advance() {
    if (stage === 'ngxpulse') {
      if (domain) {
        setStage('clearbit');
      } else {
        setStage('letter');
      }
    } else if (stage === 'clearbit') {
      if (domain) {
        setStage('google');
      } else {
        setStage('letter');
      }
    } else {
      setStage('letter');
    }
  }

  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: r,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  if (stage === 'letter') {
    return (
      <div
        className="slogo fb"
        style={{
          ...style,
          borderColor: `${color}44`,
          color,
          background: `${color}18`,
          fontSize: Math.round(size * 0.38),
          fontWeight: 700,
          border: `1px solid ${color}44`,
        }}
      >
        {letter}
      </div>
    );
  }

  let src = '';
  if (stage === 'ngxpulse') {
    const ext = NGX_SVG_SYMS.has(sym) ? 'svg' : 'png';
    src = `${NGXPULSE_BASE}${sym}.${ext}`;
  } else if (stage === 'clearbit') {
    src = `https://logo.clearbit.com/${domain}`;
  } else if (stage === 'google') {
    src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  return (
    <div className="slogo" style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={sym}
        width={size}
        height={size}
        style={{ width: size, height: size, objectFit: 'contain', borderRadius: r }}
        onError={advance}
      />
    </div>
  );
}
