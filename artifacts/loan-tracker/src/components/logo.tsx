type LogoProps = { className?: string };

/**
 * Inner "Ledger" glyph — stacked ledger entry rows with a single settled-coin
 * accent. Designed to sit inside a colored container (inherits color via
 * `currentColor`); the coin keeps its emerald accent regardless of context.
 */
export function LogoGlyph({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <rect x="3.5" y="5.5" width="11" height="2.6" rx="1.3" fill="currentColor" />
      <rect x="3.5" y="10.7" width="14" height="2.6" rx="1.3" fill="currentColor" fillOpacity="0.85" />
      <rect x="3.5" y="15.9" width="8.5" height="2.6" rx="1.3" fill="currentColor" fillOpacity="0.7" />
      <circle cx="19" cy="6.8" r="2.4" fill="#34d399" />
    </svg>
  );
}

/**
 * Self-contained app-icon mark — the indigo rounded square plus the glyph.
 * Use where you need the full badge without an external container.
 */
export function LogoMark({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="ledger-mark-bg"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#ledger-mark-bg)" />
      <rect x="11" y="13" width="20" height="4.4" rx="2.2" fill="#ffffff" />
      <rect x="11" y="21.8" width="26" height="4.4" rx="2.2" fill="#ffffff" fillOpacity="0.85" />
      <rect x="11" y="30.6" width="15" height="4.4" rx="2.2" fill="#ffffff" fillOpacity="0.7" />
      <circle cx="35.5" cy="15.2" r="4.2" fill="#34d399" />
    </svg>
  );
}
