import React from 'react';

interface FactoryOSLogoProps {
  /** Size of the icon mark in pixels */
  size?: number;
  /** If true, hides the wordmark and renders icon-only */
  iconOnly?: boolean;
  /** Force light text on dark background (sidebar); false = auto */
  variant?: 'dark' | 'light';
  className?: string;
}

/**
 * FactoryOS AI — primary brand logo.
 * Hexagonal circuit-board mark with blue → cyan gradient + "FactoryOS AI" wordmark.
 */
export function FactoryOSLogo({
  size = 32,
  iconOnly = false,
  variant = 'dark',
  className = '',
}: FactoryOSLogoProps) {
  const gradId = `fos-grad-${size}`;
  const isDark = variant === 'dark';

  return (
    <span className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* ── Icon Mark ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2560EA" />
            <stop offset="100%" stopColor="#00C8FF" />
          </linearGradient>
        </defs>

        {/* Outer hexagon */}
        <polygon
          points="32,3 58,18 58,46 32,61 6,46 6,18"
          stroke={`url(#${gradId})`}
          strokeWidth="2.5"
          fill="none"
          strokeLinejoin="round"
        />

        {/* Inner hexagon (smaller, rotated) */}
        <polygon
          points="32,12 50,22 50,42 32,52 14,42 14,22"
          stroke={`url(#${gradId})`}
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
          opacity="0.5"
        />

        {/* Circuit connector nodes on outer hex vertices */}
        <circle cx="32" cy="3"  r="2.2" fill={`url(#${gradId})`} />
        <circle cx="58" cy="18" r="2.2" fill={`url(#${gradId})`} />
        <circle cx="58" cy="46" r="2.2" fill={`url(#${gradId})`} />
        <circle cx="32" cy="61" r="2.2" fill={`url(#${gradId})`} />
        <circle cx="6"  cy="46" r="2.2" fill={`url(#${gradId})`} />
        <circle cx="6"  cy="18" r="2.2" fill={`url(#${gradId})`} />

        {/* Connector lines between nodes */}
        <line x1="32" y1="3"  x2="32" y2="12" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.7"/>
        <line x1="58" y1="18" x2="50" y2="22" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.7"/>
        <line x1="58" y1="46" x2="50" y2="42" stroke={`url(#${gradId})`} strokeWidth="1.5" opacity="0.7"/>

        {/* "F" letterform inside — two horizontal bars + vertical */}
        <g stroke={`url(#${gradId})`} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          {/* vertical bar */}
          <line x1="25" y1="22" x2="25" y2="42" />
          {/* top horizontal */}
          <line x1="25" y1="22" x2="39" y2="22" />
          {/* mid horizontal */}
          <line x1="25" y1="32" x2="36" y2="32" />
        </g>
      </svg>

      {/* ── Wordmark ── */}
      {!iconOnly && (
        <span className="flex flex-col leading-none">
          <span
            style={{
              fontWeight: 700,
              fontSize: '0.85rem',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              background: isDark
                ? 'linear-gradient(90deg, #2560EA 0%, #00C8FF 100%)'
                : 'linear-gradient(90deg, #1d4dd1 0%, #0099cc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            FactoryOS
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              lineHeight: 1.3,
              color: isDark ? 'rgba(255,255,255,0.5)' : '#64748b',
            }}
          >
            AI
          </span>
        </span>
      )}
    </span>
  );
}

/** Compact icon-only badge for tight spaces (e.g. login header) */
export function FactoryOSIcon({ size = 32, className = '' }: { size?: number; className?: string }) {
  return <FactoryOSLogo size={size} iconOnly className={className} />;
}
