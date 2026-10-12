export function Coin({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={className} aria-hidden>
      <defs>
        <linearGradient id="coin-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff1b8" />
          <stop offset="0.5" stopColor="#ffc94a" />
          <stop offset="1" stopColor="#ff9f1c" />
        </linearGradient>
      </defs>
      <circle cx="16" cy="16" r="15" fill="#b86a00" />
      <circle cx="16" cy="15" r="14" fill="url(#coin-face)" />
      <circle cx="16" cy="15" r="10" fill="none" stroke="#c97c00" strokeWidth="1.5" opacity="0.7" />
      <path d="M13 10.5 L10 15 L13 19.5 M19 10.5 L22 15 L19 19.5" stroke="#9a5600" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx="11" cy="8" rx="4" ry="1.6" fill="#fff" opacity="0.55" transform="rotate(-30 11 8)" />
    </svg>
  );
}
