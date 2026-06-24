type LogoProps = { className?: string };

/**
 * Inner brand glyph — a rising "growth" arrow paired with a settled coin
 * (emerald accent). Designed to sit inside a colored container (the arrow
 * inherits color via `currentColor`); the coin keeps its emerald dot
 * regardless of context.
 */
export function LogoGlyph({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5.5 16.5 L9.5 12.5 L12.5 15 L17.5 8.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 8.5 L17.5 8.5 L17.5 12"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16.5" cy="17" r="2.75" stroke="currentColor" strokeWidth="1.3" fill="none" />
      <circle cx="16.5" cy="17" r="1" fill="#34d399" />
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
          id="lk-mark-bg"
          x1="0"
          y1="0"
          x2="48"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#lk-mark-bg)" />
      <path
        d="M11 33 L19 25 L25 30 L35 17"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28 17 L35 17 L35 24"
        stroke="#ffffff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="34" r="5.5" stroke="#ffffff" strokeWidth="2.4" fill="none" />
      <circle cx="33" cy="34" r="1.8" fill="#34d399" />
    </svg>
  );
}
